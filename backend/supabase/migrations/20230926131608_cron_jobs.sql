SELECT CRON.SCHEDULE(
  'invoke-cron-event-process',
  '*/30 * * * *', -- every 30 minutes
  $$
      SELECT fn_events_process_upcoming();
  $$
); 
