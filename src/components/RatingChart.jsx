import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import { format } from 'date-fns';

export default function RatingChart({ history, targetRating, startDate }) {
  if (!history || history.length === 0) {
    return <p className="text-sm text-gray-400 italic py-4">No rating history available</p>;
  }

  const startTs = new Date(startDate).getTime();
  const filtered = history.filter((h) => h.date >= startTs);
  const data = (filtered.length > 0 ? filtered : history.slice(-50)).map((h) => ({
    date: h.date,
    rating: h.rating,
    label: format(new Date(h.date), 'MMM d'),
  }));

  const ratings = data.map((d) => d.rating);
  const minR = Math.min(...ratings, targetRating) - 20;
  const maxR = Math.max(...ratings, targetRating) + 20;

  return (
    <div className="w-full h-48 mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <XAxis
            dataKey="label"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[minR, maxR]}
            tick={{ fill: '#9ca3af', fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a2e1a',
              border: '1px solid #4a7c59',
              borderRadius: '8px',
              color: '#e5e7eb',
              fontSize: '12px',
            }}
            labelFormatter={(_, payload) => {
              if (payload?.[0]) {
                return format(new Date(payload[0].payload.date), 'MMM d, yyyy h:mm a');
              }
              return '';
            }}
          />
          <ReferenceLine
            y={targetRating}
            stroke="#d4a843"
            strokeDasharray="5 5"
            label={{ value: `Target: ${targetRating}`, fill: '#d4a843', fontSize: 11, position: 'right' }}
          />
          <Line
            type="monotone"
            dataKey="rating"
            stroke="#6abf6a"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#6abf6a' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
