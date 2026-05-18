namespace AnomalyDetectionDashboard.DTOs
{
    // GET /api/dashboard/kpis?from=2024-01-01&to=2024-01-31
    public class DashboardKpis
    {
        public long? TotalEvents { get; set; }
        public int? TotalEntities { get; set; }
        public int? InitializedCount { get; set; }
        public double? InitializedPercentage { get; set; }
        public int? Outliers { get; set; }
        public int? ActiveAgents { get; set; }
    }
    //public int[] EventsByHour { get; set; }

            // GET /api/dashboard/charts/heatmap
            //public int[,] Heatmap { get; set; } // 7x24 matrix

    // GET /api/dashboard/charts/top-processes?limit=10
    public class TopItem
    {
        public string Name { get; set; }
        public long Count { get; set; }
    }

    // GET /api/alerts?from=2024-01-01&user=john&unread=true&page=1&size=50
    //public class AlertListResponse
    //{
    //    public List<AlertModel> Alerts { get; set; }
    //    public int TotalCount { get; set; }
    //    public int Page { get; set; }
    //    public int PageSize { get; set; }
    //}

    // POST /api/alerts/{id}/investigate
    public class InvestigateRequest
    {
        public string AnalystNote { get; set; }
    }

    // GET /api/alerts?from=2024-01-01&user=john&unread=true&page=1&size=50
    //public class AlertListResponse
    //{
    //    public List<AlertModel> Alerts { get; set; }
    //    public int TotalCount { get; set; }
    //    public int Page { get; set; }
    //    public int PageSize { get; set; }
    //}

    // POST /api/alerts/{id}/investigate
    //public class InvestigateRequest
    //{
    //    public string AnalystNote { get; set; }
    //}

    // GET /api/entities?initialized=true&stale=false&search=test&page=1&size=100
    //public class EntityListResponse
    //{
    //    public List<EntityModel> Entities { get; set; }
    //    public EntitySummary Summary { get; set; }
    //    public int TotalCount { get; set; }
    //}

    public class EntitySummary
    {
        public int ActiveAgents { get; set; }
        public int TotalAgents { get; set; }
        public int InitializedCount { get; set; }
        public double InitializedPercentage { get; set; }
    }

    // GET /api/settings
    // PUT /api/settings
    //public class SettingsModel
    //{
    //    public WebhookSettings Webhook { get; set; }
    //    public SyslogSettings Syslog { get; set; }
    //    public bool AutoLockUser { get; set; }
    //}

    public class WebhookSettings
    {
        public bool Enabled { get; set; }
        public string Host { get; set; }
        public int Port { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
    }

    // GET /api/configurations
    public class ConfigurationModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsUsed { get; set; }
        public List<string> UsedByGroups { get; set; }
    }

    // GET /api/groups
    // POST /api/groups
    // PUT /api/groups/{id}/agents
    public class GroupModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int ConfigurationId { get; set; }
        public List<string> AssignedAgents { get; set; }
    }
}
