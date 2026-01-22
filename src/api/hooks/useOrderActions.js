import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiService from "@/api/api";
import { SINGLE_ORDER_API } from "@/api/apiEndPoint";
import toast from "react-hot-toast";

export const useOrderActions = () => {
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, currentPayStatus, newStatus }) => {
      const res = await apiService.put(SINGLE_ORDER_API(orderId), {
        pay_status: String(currentPayStatus),
        status: String(newStatus),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders-list"] });
      queryClient.invalidateQueries({ queryKey: ["orders-stats"] });
      toast.success("Status updated!");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async ({ orderId, message }) => {
      const res = await apiService.delete(SINGLE_ORDER_API(orderId), {
        data: { cancel_message: message || "Admin Action" },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders-list"] });
      queryClient.invalidateQueries({ queryKey: ["orders-stats"] });
      toast.success("Order has been removed/cancelled");
    },
    onError: () => toast.error("Failed to remove order"),
  });

  const confirmAndDelete = (orderId, message = "Out of Stock") => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      deleteOrderMutation.mutate({ orderId, message });
    }
  };

  return {
    updateStatus: (orderId, currentPayStatus, newStatus) =>
      updateStatusMutation.mutate({ orderId, currentPayStatus, newStatus }),
    deleteOrder: confirmAndDelete,
    isUpdating: updateStatusMutation.isPending || deleteOrderMutation.isPending,
  };
};
