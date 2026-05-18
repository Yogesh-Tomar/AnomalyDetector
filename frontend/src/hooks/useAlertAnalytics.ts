import { useState, useEffect } from 'react';
import { 
  dashboardApi, 
  AlertSeverityTimelineResponse, 
  ZDistributionResponse, 
  BacklogStatusResponse, 
  AlertAgeResponse, 
  TopKeysResponse 
} from '../services/dashboardApi';

export function useAlertSeverityTimeline(from?: string, to?: string) {
  const [data, setData] = useState<AlertSeverityTimelineResponse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!from || !to) return;
    setLoading(true);
    setError(null);
    dashboardApi.getAlertSeverityTimeline(from, to)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [from, to]);

  return { data, loading, error };
}

export function useZScoreDistribution(from?: string, to?: string) {
  const [data, setData] = useState<ZDistributionResponse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!from || !to) return;
    setLoading(true);
    setError(null);
    dashboardApi.getZScoreDistribution(from, to)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [from, to]);

  return { data, loading, error };
}

export function useBacklogStatus(from?: string, to?: string) {
  const [data, setData] = useState<BacklogStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!from || !to) return;
    setLoading(true);
    setError(null);
    dashboardApi.getBacklogStatus(from, to)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [from, to]);
  return { data, loading, error };
}

export function useAlertAgeHistogram(from?: string, to?: string) {
  const [data, setData] = useState<AlertAgeResponse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!from || !to) return;
    setLoading(true);
    setError(null);
    dashboardApi.getAlertAgeHistogram(from, to)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [from, to]);

  return { data, loading, error };
}

export function useTopKeysByZLoad(from?: string, to?: string) {
  const [data, setData] = useState<TopKeysResponse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!from || !to) return;
    setLoading(true);
    setError(null);
    dashboardApi.getTopKeysByZLoad(from, to)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [from, to]);

  return { data, loading, error };
}