import { useState, useEffect } from "react";
import dashboardService, {
  DashboardOverview,
  PopularProductItem,
  SalesDataPoint,
} from "../services/dashboardService";

export const useDashboardOverview = () => {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getOverview();
      if (response.success) {
        setData(response.data);
      } else {
        setError("Failed to fetch dashboard overview");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};

export const usePopularProducts = (page = 1, limit = 5) => {
  const [products, setProducts] = useState<PopularProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getPopularProducts({ page, limit });
      if (response.success) {
        setProducts(response.data);
      } else {
        setError("Failed to fetch popular products");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit]);

  return { products, loading, error, refetch: fetchData };
};

export const useSalesOverview = (daily = false, monthly = false) => {
  const [data, setData] = useState<SalesDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    // Don't fetch if neither daily nor monthly is selected
    if (!daily && !monthly) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await dashboardService.getSalesOverview({ daily, monthly });
      if (response.success) {
        setData(response.data);
      } else {
        setError("Failed to fetch sales overview");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [daily, monthly]);

  return { data, loading, error, refetch: fetchData };
};
