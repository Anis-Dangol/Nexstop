import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const fareApi = createApi({
  reducerPath: "fareApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/fare",
  }),
  tagTypes: ["FareConfig"],
  endpoints: (builder) => ({
    getAllFareConfigs: builder.query({
      query: () => "/",
      providesTags: ["FareConfig"],
    }),
    createFareConfig: builder.mutation({
      query: (fareConfig) => ({
        url: "/",
        method: "POST",
        body: fareConfig,
      }),
      invalidatesTags: ["FareConfig"],
    }),
    updateFareConfig: builder.mutation({
      query: ({ id, ...fareConfig }) => ({
        url: `/${id}`,
        method: "PUT",
        body: fareConfig,
      }),
      invalidatesTags: ["FareConfig"],
    }),
    deleteFareConfig: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FareConfig"],
    }),
  }),
});

export const {
  useGetAllFareConfigsQuery,
  useCreateFareConfigMutation,
  useUpdateFareConfigMutation,
  useDeleteFareConfigMutation,
} = fareApi;
