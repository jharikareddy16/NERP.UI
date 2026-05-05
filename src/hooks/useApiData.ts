import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  employeesApi,
  categoriesApi,
  recognitionsApi,
  CreateRecognitionRequest,
} from "@/services/api";

export function useEmployees() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: employeesApi.getAll,
  });
}

export function useAwardCategories() {
  return useQuery({
    queryKey: ["awardCategories"],
    queryFn: categoriesApi.getAll,
  });
}

export function useRecognitions(params?: { status?: string; type?: string }) {
  return useQuery({
    queryKey: ["recognitions", params || {}],

    queryFn: async () => {
      try {
        const res = await recognitionsApi.getAll(params);

        // ✅ Ensure always array
        return Array.isArray(res) ? res : [];
      } catch (error) {
        console.error("Error fetching recognitions:", error);
        return []; // prevent infinite loading
      }
    },

    // ✅ VERY IMPORTANT
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useMyRecognitions() {
  return useQuery({
    queryKey: ["recognitions", "my"],
    queryFn: recognitionsApi.getMy,
  });
}

export function useCreateRecognition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRecognitionRequest) => recognitionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recognitions"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useApproveRecognition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => recognitionsApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recognitions"] });
    },
  });
}

export function useRejectRecognition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => recognitionsApi.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recognitions"] });
    },
  });
}
