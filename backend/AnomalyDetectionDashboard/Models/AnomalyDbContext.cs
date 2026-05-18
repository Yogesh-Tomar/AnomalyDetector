using AnomalyDetectionDashboard.DTOs;
using Microsoft.EntityFrameworkCore;

namespace AnomalyDetectionDashboard.Models
{
    public class AnomalyDbContext : DbContext
    {
        public AnomalyDbContext(DbContextOptions<AnomalyDbContext> options) : base(options) { }

        public DbSet<Alert> Alerts { get; set; }
        public DbSet<Agent> Agents { get; set; }
        public DbSet<Dump> Dumps { get; set; }
        public DbSet<AnalystNote> AnalystNote { get; set; }
        public DbSet<Event> Events { get; set; }
        public DbSet<Entity> Entities { get; set; }
        public DbSet<Stat> Stats { get; set; }
        public DbSet<Key> Keys { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<ConfigState> ConfigStates { get; set; }
        public DbSet<Setting> Settings { get; set; }
        public DbSet<DimMetric> DimMetrics { get; set; }
        public DbSet<MetricToEid> MetricToEids { get; set; }
        //public DbSet<RawEvent> RawEvents { get; set; }
        public DbSet<AlertWhitelistRule> AlertWhitelistRules { get; set; }
        public DbSet<Network> Networks { get; set; }
        public DbSet<NetworkConnection> NetworkConnections => Set<NetworkConnection>();
        public DbSet<NetworkGraphEdge> NetworkGraphEdges => Set<NetworkGraphEdge>();
        public DbSet<NetworkNode> NetworkNodes => Set<NetworkNode>();
        public DbSet<Cmdb> Cmdb { get; set; }
        public DbSet<AlertEventExact> vAlertsEvents_ByKey_Exact { get; set; }
        public DbSet<SpikeOneHourDTO> SpikeOneHourDTOs { get; set; }
        public DbSet<RareParentChild7dDTO> RareParentChild7d { get; set; }
        public DbSet<NewSldTodayDTO> NewSldToday { get; set; }
        public DbSet<NewLastDayNotSeen30dDTO> NewLastDayNotSeen30d { get; set; }

        public DbSet<Event1ProcessCreateDTO> Event1ProcessCreate { get; set; }
        public DbSet<Event2FileCreateTimeChangedDTO> Event2FileCreateTimeChanged { get; set; }
        public DbSet<Event3NetworkConnectDTO> Event3NetworkConnect { get; set; }
        public DbSet<Event4SysmonServiceStateDTO> Event4SysmonServiceState { get; set; }
        public DbSet<Event5ProcessTerminateDTO> Event5ProcessTerminate { get; set; }
        public DbSet<Event6DriverLoadDTO> Event6DriverLoad { get; set; }
        public DbSet<Event7ImageLoadDTO> Event7ImageLoad { get; set; }
        public DbSet<Event8CreateRemoteThreadDTO> Event8CreateRemoteThread { get; set; }
        public DbSet<Event9RawAccessReadDTO> Event9RawAccessRead { get; set; }
        public DbSet<Event10ProcessAccessDTO> Event10ProcessAccess { get; set; }
        public DbSet<Event11FileCreateDTO> Event11FileCreate { get; set; }
        public DbSet<Event12RegistryCreateDeleteDTO> Event12RegistryCreateDelete { get; set; }
        public DbSet<Event13RegistryValueSetDTO> Event13RegistryValueSet { get; set; }
        public DbSet<Event14RegistryRenameDTO> Event14RegistryRename { get; set; }
        public DbSet<Event15FileCreateStreamHashDTO> Event15FileCreateStreamHash { get; set; }
        public DbSet<Event16SysmonConfigChangeDTO> Event16SysmonConfigChange { get; set; }
        public DbSet<Event17_18PipeDTO> Event17_18Pipe { get; set; }
        public DbSet<Event19WmiEventFilterDTO> Event19WmiEventFilter { get; set; }
        public DbSet<Event20WmiEventConsumerDTO> Event20WmiEventConsumer { get; set; }
        public DbSet<Event21WmiFilterToConsumerDTO> Event21WmiFilterToConsumer { get; set; }
        public DbSet<Event22DnsQueryDTO> Event22DnsQuery { get; set; }
        public DbSet<Event23FileDeleteDTO> Event23FileDelete { get; set; }
        public DbSet<Event25ProcessTamperDTO> Event25ProcessTamper { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            modelBuilder.Entity<Alert>(entity =>
            {
                entity.HasKey(e => new { e.AgentId, e.TsUtc, e.Metric, e.KeyId });
            
            });

            modelBuilder.Entity<Event>(entity =>
            {
                entity.HasKey(e => e.EventRowId);

                entity.Property(e => e.KeyHash)
                    .HasComputedColumnSql("[KeyHash]", stored: false);

                entity.Property(e => e.EventHash)
                    .HasComputedColumnSql("[EventHash]", stored: false);

                entity.Property(e => e.Metric)
                    .HasComputedColumnSql("[Metric]", stored: false);
            });

            modelBuilder.Entity<Entity>(entity =>
            {
                entity.HasKey(e => new { e.Key, e.AgentId});
            });
            modelBuilder.Entity<Setting>(entity =>
            {
                entity.HasKey(e => new { e.SettingKey });
            });
            // ConfigState configuration
            modelBuilder.Entity<ConfigState>(entity =>
            {
                entity.HasKey(e => e.ConfigStateId);
                entity.Property(e => e.CreatedUtc).HasDefaultValueSql("sysutcdatetime()");
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.HasIndex(e => e.ConfigName).HasDatabaseName("IX_ConfigStates_ConfigName");
                entity.HasIndex(e => e.CreatedUtc).HasDatabaseName("IX_ConfigStates_CreatedUtc");
                entity.HasIndex(e => e.IsActive).HasDatabaseName("IX_ConfigStates_IsActive");
            });

            // Stat configuration - composite primary key
            modelBuilder.Entity<Stat>(entity =>
            {
                entity.HasKey(e => new { e.AgentId, e.TsUtc, e.Metric, e.KeyId })
                    .HasName("PK_Stats_KeyId");

                entity.HasIndex(e => e.KeyId).HasDatabaseName("IX_Stats_KeyId");

                // Foreign key relationships
                entity.HasOne(d => d.KeyEntity)
                    .WithMany(p => p.Stats)
                    .HasForeignKey(d => d.KeyId)
                    .HasConstraintName("FK_Stats_Keys");

                entity.HasOne(d => d.Agent)
                    .WithMany(p => p.Stats)
                    .HasForeignKey(d => d.AgentId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(d => d.MetricEntity)
                    .WithMany(p => p.Stats)
                    .HasForeignKey(d => d.Metric)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // PidsCurrent composite key configuration
            modelBuilder.Entity<PidsCurrent>(entity =>
            {
                entity.HasKey(e => new { e.AgentId, e.Pid, e.Key });
            });

            // Key configuration
            modelBuilder.Entity<Models.Key>(entity =>
            {
                entity.HasKey(e => e.KeyId);
                entity.Property(e => e.KeyId).ValueGeneratedOnAdd();

                // Map the property name to column name
                entity.Property(e => e.KeyValue).HasColumnName("Key");

                // Computed columns - read-only
                entity.Property(e => e.KeyHash)
                    .HasComputedColumnSql("CONVERT([varbinary](32),hashbytes('SHA2_256',[dbo].[ufn_KeyNormalize]([Key])))")
                    .ValueGeneratedOnAddOrUpdate();

                entity.Property(e => e.KeyPrefix)
                    .HasComputedColumnSql("left([dbo].[ufn_KeyNormalize]([Key]),(128))")
                    .ValueGeneratedOnAddOrUpdate();

                // Unique constraint on AgentId + KeyHash
                entity.HasIndex(e => new { e.AgentId, e.KeyHash })
                    .IsUnique()
                    .HasDatabaseName("UQ_Keys");

                entity.HasIndex(e => new { e.AgentId, e.KeyHash })
                    .HasDatabaseName("IX_Keys_Lookup")
                    .IncludeProperties(e => e.KeyValue);

                entity.HasIndex(e => new { e.AgentId, e.KeyPrefix })
                    .HasDatabaseName("IX_Keys_Prefix")
                    .IncludeProperties(e => new { e.KeyId, e.KeyValue });

                // Foreign key to Agent
                entity.HasOne(d => d.Agent)
                    .WithMany(p => p.Keys)
                    .HasForeignKey(d => d.AgentId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // DimMetric configuration
            modelBuilder.Entity<DimMetric>(entity =>
            {
                entity.HasKey(e => e.Metric);
                entity.ToTable("DimMetric");
            });

            // MetricToEid configuration
            modelBuilder.Entity<MetricToEid>(entity =>
            {
                entity.HasKey(e => new { e.Metric, e.Eid });

                entity.HasOne(d => d.MetricEntity)
                    .WithMany(p => p.MetricToEids)
                    .HasForeignKey(d => d.Metric)
                    .HasConstraintName("FK_MetricToEid_Metric");
            });

            // Group configuration update
            modelBuilder.Entity<Group>(entity =>
            {
                entity.HasKey(e => e.GroupId);
                entity.Property(e => e.CreatedUtc).HasDefaultValueSql("sysutcdatetime()");
                entity.Property(e => e.UpdatedUtc).HasDefaultValueSql("sysutcdatetime()");

                entity.HasIndex(e => e.Name)
                    .IsUnique()
                    .HasDatabaseName("UX_Groups_Name");

                entity.HasOne(d => d.ConfigState)
                    .WithMany(p => p.Groups)
                    .HasForeignKey(d => d.ConfigStateId)
                    .HasConstraintName("FK_Groups_ConfigStates");
            });

            modelBuilder.Entity<AlertWhitelistRule>(entity =>
            {
                entity.HasKey(e => e.RuleId);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.Suppress).HasDefaultValue(true);
                entity.Property(e => e.Priority).HasDefaultValue(100);
                entity.Property(e => e.UserLike).HasMaxLength(256);
                entity.Property(e => e.ProcessLike).HasMaxLength(512);
                entity.Property(e => e.Reason).HasMaxLength(512);
            });

            // Configure network graph entities as views (read-only)
            modelBuilder.Entity<NetworkConnection>(entity =>
            {
                entity.HasNoKey();
                entity.ToView("vNetworkConnections");
            });

            modelBuilder.Entity<NetworkGraphEdge>(entity =>
            {
                entity.HasNoKey();
                entity.ToView("vNetworkGraph");
            });

            modelBuilder.Entity<NetworkNode>(entity =>
            {
                entity.HasNoKey();
                entity.ToView("vNetworkNodes");
            });

            modelBuilder.Entity<AlertEventExact>()
            .HasNoKey()
            .ToView("vAlertsEvents_ByKey_Exact");

            modelBuilder.Entity<SpikeOneHourDTO>().HasNoKey().ToView("vHunt_Spike_1h");

            modelBuilder.Entity<RareParentChild7dDTO>().HasNoKey().ToView("vHunt_Rare_PC_7d");

            modelBuilder.Entity<NewSldTodayDTO>().HasNoKey().ToView("vHunt_NewSld_Today");

            modelBuilder.Entity<NewLastDayNotSeen30dDTO>().HasNoKey().ToView("vHunt_New_LastDay_NotSeen30d");

            modelBuilder.Entity<Event1ProcessCreateDTO>().HasNoKey().ToView("vEvent_1_ProcessCreate");
            modelBuilder.Entity<Event2FileCreateTimeChangedDTO>().HasNoKey().ToView("vEvent_2_FileCreateTimeChanged");
            modelBuilder.Entity<Event3NetworkConnectDTO>().HasNoKey().ToView("vEvent_3_NetworkConnect");
            modelBuilder.Entity<Event4SysmonServiceStateDTO>().HasNoKey().ToView("vEvent_4_SysmonServiceState");
            modelBuilder.Entity<Event5ProcessTerminateDTO>().HasNoKey().ToView("vEvent_5_ProcessTerminate");
            modelBuilder.Entity<Event6DriverLoadDTO>().HasNoKey().ToView("vEvent_6_DriverLoad");
            modelBuilder.Entity<Event7ImageLoadDTO>().HasNoKey().ToView("vEvent_7_ImageLoad");
            modelBuilder.Entity<Event8CreateRemoteThreadDTO>().HasNoKey().ToView("vEvent_8_CreateRemoteThread");
            modelBuilder.Entity<Event9RawAccessReadDTO>().HasNoKey().ToView("vEvent_9_RawAccessRead");
            modelBuilder.Entity<Event10ProcessAccessDTO>().HasNoKey().ToView("vEvent_10_ProcessAccess");
            modelBuilder.Entity<Event11FileCreateDTO>().HasNoKey().ToView("vEvent_11_FileCreate");
            modelBuilder.Entity<Event12RegistryCreateDeleteDTO>().HasNoKey().ToView("vEvent_12_RegistryCreateDelete");
            modelBuilder.Entity<Event13RegistryValueSetDTO>().HasNoKey().ToView("vEvent_13_RegistryValueSet");
            modelBuilder.Entity<Event14RegistryRenameDTO>().HasNoKey().ToView("vEvent_14_RegistryRename");
            modelBuilder.Entity<Event15FileCreateStreamHashDTO>().HasNoKey().ToView("vEvent_15_FileCreateStreamHash");
            modelBuilder.Entity<Event16SysmonConfigChangeDTO>().HasNoKey().ToView("vEvent_16_SysmonConfigChange");
            modelBuilder.Entity<Event17_18PipeDTO>().HasNoKey().ToView("vEvent_17_18_Pipe");
            modelBuilder.Entity<Event19WmiEventFilterDTO>().HasNoKey().ToView("vEvent_19_WmiEventFilter");
            modelBuilder.Entity<Event20WmiEventConsumerDTO>().HasNoKey().ToView("vEvent_20_WmiEventConsumer");
            modelBuilder.Entity<Event21WmiFilterToConsumerDTO>().HasNoKey().ToView("vEvent_21_WmiFilterToConsumer");
            modelBuilder.Entity<Event22DnsQueryDTO>().HasNoKey().ToView("vEvent_22_DnsQuery");
            modelBuilder.Entity<Event23FileDeleteDTO>().HasNoKey().ToView("vEvent_23_FileDelete");
            modelBuilder.Entity<Event25ProcessTamperDTO>().HasNoKey().ToView("vEvent_25_ProcessTamper");
        }    
    }
}
