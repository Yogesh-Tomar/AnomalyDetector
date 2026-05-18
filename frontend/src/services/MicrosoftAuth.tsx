import { useEffect, useState } from 'react';
import { useSession } from './SessionContext'; // Import to integrate with session context
import { PublicClientApplication, LogLevel } from '@azure/msal-browser'; // Add this import
import { endpoints } from './api';

// TypeScript interfaces for better type safety
interface MsalConfig {
  auth: {
    clientId: string;
    authority: string;
    redirectUri: string;
    postLogoutRedirectUri: string;
  };
  cache: {
    cacheLocation: 'localStorage' | 'sessionStorage';
    storeAuthStateInCookie: boolean;
  };
  system: {
    loggerOptions: {
      loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => void; // Updated type
    };
  };
}

interface LoginRequest {
  scopes: string[];
  prompt: string;
}

interface MicrosoftAuthResponse {
  idToken: string;
  accessToken: string;
  account: {
    username: string;
    email: string;
    name: string;
    role: string;
    azureId: string;
    claims: any;
  };
  graphData: any;
}

// MSAL Configuration - Update these values with your Azure AD app registration details
const msalConfig: MsalConfig = {
  auth: {
    clientId: import.meta.env.VITE_MSAL_CLIENT_ID || '',
    authority: import.meta.env.VITE_MSAL_AUTHORITY || '',
    redirectUri: import.meta.env.VITE_MSAL_REDIRECT_URI || (window.location.origin + '/login'),
    postLogoutRedirectUri: import.meta.env.VITE_MSAL_POST_LOGOUT_REDIRECT_URI || (window.location.origin + '/login')
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            break;
          case LogLevel.Warning:
            console.warn(message);
            break;
          case LogLevel.Info:
            console.info(message);
            break;
          case LogLevel.Verbose:
            console.debug(message);
            break;
        }
      }
    }
  }
};

// Login scopes - requesting user profile and optional group membership
const loginRequest: LoginRequest = {
  scopes: [
    'openid',
    'profile', 
    'email',
    'User.Read',
    'Group.Read.All' // Optional: to read user's group memberships for role mapping
  ],
  prompt: 'select_account' // Forces account selection even if single account
};

// Custom hook for Microsoft Authentication
export function useMicrosoftAuth() {
  const { setSession } = useSession();
  const [msalInstance, setMsalInstance] = useState<PublicClientApplication | null>(null); // Updated type
  const [error, setError] = useState<string>('');

  // Initialize MSAL on mount
  useEffect(() => {
    const initializeMsal = async () => {
      const instance = new PublicClientApplication(msalConfig);
      await instance.initialize(); // Add this line to initialize MSAL
      setMsalInstance(instance);

      // Handle the redirect promise when returning from Microsoft login
      instance.handleRedirectPromise()
        .then((response: any) => handleMicrosoftResponse(response, setSession, setError))
        .catch((error: any) => {
          console.error('Error handling redirect:', error);
          setError('Microsoft login failed: ' + error.message);
        });
    };
    initializeMsal();
  }, [setSession]);

  // Login function
  const loginWithMicrosoft = async () => {
    if (!msalInstance) {
      setError('Microsoft authentication not properly configured');
      return;
    }

    try {
      // Try popup first, fall back to redirect if blocked
      try {
        const response = await msalInstance.loginPopup(loginRequest);
        await handleMicrosoftResponse(response, setSession, setError);
      } catch (popupError) {
        // If popup blocked, use redirect
        console.warn('Popup blocked, using redirect flow');
        await msalInstance.loginRedirect(loginRequest);
      }
    } catch (error: any) {
      console.error('Microsoft login error:', error);
      setError('Microsoft login failed: ' + error.message);
    }
  };

  // Logout function
  const logoutMicrosoft = async () => {
    if (!msalInstance) return;
    
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length === 0) return;
    
    const logoutRequest = {
      account: accounts[0],
      postLogoutRedirectUri: msalConfig.auth.postLogoutRedirectUri
    };
    
    try {
      await msalInstance.logoutPopup(logoutRequest);
    } catch (error) {
      // Fallback to redirect
      await msalInstance.logoutRedirect(logoutRequest);
    }
  };

  // Check if user is logged in with Microsoft
  const isMicrosoftUser = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.authType === 'microsoft';
  };

  // Get current Microsoft account
  const getCurrentMicrosoftAccount = () => {
    if (!msalInstance) return null;
    const accounts = msalInstance.getAllAccounts();
    return accounts.length > 0 ? accounts[0] : null;
  };

  // Silently refresh Microsoft token
  const refreshMicrosoftToken = async () => {
    if (!msalInstance) return null;
    
    const account = getCurrentMicrosoftAccount();
    if (!account) return null;
    
    const silentRequest = {
      ...loginRequest,
      account: account,
      forceRefresh: false
    };
    
    try {
      const response = await msalInstance.acquireTokenSilent(silentRequest);
      return response.accessToken;
    } catch (error: any) {
      console.error('Silent token refresh failed:', error);
      // Need to re-authenticate
      await msalInstance.acquireTokenRedirect(loginRequest);
    }
  };

  return {
    loginWithMicrosoft,
    logoutMicrosoft,
    isMicrosoftUser,
    refreshMicrosoftToken,
    getCurrentMicrosoftAccount,
    error
  };
}

// Helper function to handle Microsoft response
async function handleMicrosoftResponse(response: any, setSession: (user: any, token: string | null) => void, setError: (error: string) => void) {
  if (!response || !response.account) {
    return;
  }

  try {
    // Get the ID token claims
    const account = response.account;
    const idTokenClaims = response.idTokenClaims || {};
    
    // Extract role from groups or custom claims
    const groups = idTokenClaims.groups || [];
    const roles = idTokenClaims.roles || [];
    
    // Map Azure AD groups/roles to application roles
    let userRole = 'analyst'; // Default role
    
    // Check for admin group/role (configure these GUIDs based on your Azure AD setup)
    const adminGroupIds = ['ADMIN_GROUP_GUID_1', 'ADMIN_GROUP_GUID_2']; // Replace with actual group IDs
    const adminRoles = ['Admin', 'Administrator', 'GlobalAdmin'];
    
    if (groups.some((g: string) => adminGroupIds.includes(g)) || 
        roles.some((r: string) => adminRoles.includes(r))) {
      userRole = 'admin';
    }
    
    // Alternatively, check custom claims if you've configured them
    if (idTokenClaims['extension_Role'] === 'Admin' || 
        idTokenClaims['extension_Role'] === 'admin') {
      userRole = 'admin';
    }
    
    if (import.meta.env.DEV) {
      console.log('Determined user role:', userRole);
    }
    
    // Start Graph API call in parallel (don't await it)
    const graphPromise = callMicrosoftGraph(response.accessToken, 2000).catch(() => null);
    
    // Authenticate with backend immediately without waiting for Graph API
    await authenticateWithBackend({
      idToken: response.idToken,
      accessToken: response.accessToken,
      account: {
        username: account.username || account.preferredUsername || account.name,
        email: account.username, // Usually UPN in Azure AD
        name: account.name,
        role: userRole,
        azureId: account.localAccountId || account.homeAccountId,
        claims: idTokenClaims
      },
      graphData: await graphPromise // Only wait if backend auth completes first
    }, setSession, setError);
    
  } catch (error: any) {
    console.error('Error processing Microsoft authentication:', error);
    setError('Failed to process Microsoft login: ' + error.message);
  }
}

// Call Microsoft Graph API with timeout
async function callMicrosoftGraph(accessToken: string, timeoutMs: number = 3000) {
  if (!accessToken) return null;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      return await response.json();
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.warn('Graph API call timed out, proceeding without Graph data');
    } else {
      console.error('Graph API call failed:', error);
    }
  }
  
  return null;
}

// Authenticate with backend
async function authenticateWithBackend(microsoftAuth: MicrosoftAuthResponse, setSession: (user: any, token: string | null) => void, setError: (error: string) => void) {
  try {
    const _data = {
        idToken: microsoftAuth.idToken,
        accessToken: microsoftAuth.accessToken,
        account: microsoftAuth.account
      };
    const response = await endpoints.MicrosoftAuth(_data);
    
    if (!response || response.status !== 200) {
      throw new Error('Backend authentication failed');
    }
    const data = response.data as { token: string; user: any };
    
    // Store user session (now using localStorage for consistency)
    const user = {
      username: data.user.username || microsoftAuth.account.username,
      role: data.user.role || microsoftAuth.account.role,
      email: data.user.email || microsoftAuth.account.email
    };
    
    setSession(user, data.token || null);
    
    // Use React Router navigation instead of full page reload
    // The navigation will be handled by the calling component
    // window.location.href = '/dashboard';
    
  } catch (error: any) {
    console.error('Backend authentication error:', error);
    
    // Fallback for demo/development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.warn('Using client-side session fallback - configure backend for production');
      
      const user = {
        username: microsoftAuth.account.username,
        role: microsoftAuth.account.role,
        email: microsoftAuth.account.email
      };
      
      setSession(user, null);
      // Navigation will be handled by the calling component
    } else {
      setError('Authentication failed. Please try again or use local login.');
    }
  }
}