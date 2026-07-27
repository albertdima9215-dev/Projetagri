import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Doughnut } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

function OrdersChart({ stats }) {

  const data = {

    labels: [
      "Livrées",
      "En attente",
      "Annulées",
    ],

    datasets: [
      {
        data: [
          stats.deliveredOrders,
          stats.pendingOrders,
          stats.cancelledOrders,
        ],
      },
    ],

  };

  return <Doughnut data={data} />;
}

export default OrdersChart;