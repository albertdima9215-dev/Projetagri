import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

function OrdersChart({ stats }) {
  const data = [
    {
      name: "Livrées",
      value: stats.deliveredOrders || 0,
    },
    {
      name: "En attente",
      value: stats.pendingOrders || 0,
    },
    {
      name: "Annulées",
      value: stats.cancelledOrders || 0,
    },
  ];

  // Couleurs
  const COLORS = [
    "#2e7d32", // vert
    "#f9a825", // jaune/orange
    "#d32f2f", // rouge
  ];

  return (
    <div className="orders-chart-container">
      <h3>📊 Répartition des commandes</h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={4}
            dataKey="value"
            label={({ percent }) =>
              `${(percent * 100).toFixed(0)}%`
            }
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip
            formatter={(value) => [`${value} commande(s)`]}
          />

          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default OrdersChart;
