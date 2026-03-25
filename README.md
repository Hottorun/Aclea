# Leed_Optimizer

# api:
## JSON Request Structure (from your backend to this platform)

**POST to `/api/leads`:**

```json
{
  "name": "Customer Name",
  "phone": "+1234567890",
  "email": "customer@email.com",
  "location": "City, State",
  "workType": "Type of work",
  "conversationSummary": "AI summary",
  "approveMessage": "Pre-crafted approval",
  "declineMessage": "Pre-crafted decline",
  "rating": 4,
  "ratingReason": "Good fit - in our service area with matching work type"
}
```


# to run:
- npm install
- create a .env file and add:
-   `NEXT_PUBLIC_SUPABASE_URL=`
-   `NEXT_PUBLIC_SUPABASE_ANON_KEY=`
- npm run dev

need to do:
How Auto-Delete Works
The auto-delete feature:
- Triggers: When the dashboard loads, it checks if autoDeleteDeclinedDays > 0 in settings
For production, you should set up a cron job to call this endpoint daily:
Example cron job (run daily at midnight)
curl -X POST https://your-domain.com/api/cron/auto-delete


