import apiClient from "./apiClient";

export interface PurchaseData {
  customerName: string;
  productName: string;
  thumbnail: string;
  purchasedAt: string;
}

export interface CustomersResponse {
  success: boolean;
  data: PurchaseData[];
}

export const purchaseToastService = {
  // GET /api/v1/store/customer/recent-purchases — public, last 24h paid orders
  getRecentPurchases: async (): Promise<PurchaseData[]> => {
    try {
      const response = await apiClient.get<CustomersResponse>(
        "/api/v1/store/customer/recent-purchases",
        {
          // #region agent log
          ...({ __skipAuthRedirect: true } as object),
          // #endregion
        }
      );
      // #region agent log
      fetch('http://127.0.0.1:7682/ingest/510e7aaa-5fe9-4bfe-b44b-f784e1fadb5e',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'464b52'},body:JSON.stringify({sessionId:'464b52',runId:'post-fix',hypothesisId:'A',location:'purchaseToastService.ts:success',message:'recent purchases API ok',data:{status:response.status,count:response.data?.data?.length??0,success:response.data?.success},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      if (response.data.success && response.data.data.length > 0) {
        return response.data.data;
      }
      return [];
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7682/ingest/510e7aaa-5fe9-4bfe-b44b-f784e1fadb5e',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'464b52'},body:JSON.stringify({sessionId:'464b52',runId:'post-fix',hypothesisId:'A',location:'purchaseToastService.ts:error',message:'recent purchases API failed',data:{status:error?.response?.status??null,msg:error?.response?.data?.message??error?.message??'unknown'},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      console.error("Error fetching recent purchases:", error);
      return [];
    }
  },
};

export default purchaseToastService;
