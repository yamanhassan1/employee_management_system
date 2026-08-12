import { baseApi } from '../../app/store'

export const projectsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listProjects: builder.query({
      query: () => '/projects',
      transformResponse: (res) => res?.data || [],
      providesTags: [{ type: 'Projects', id: 'LIST' }],
    }),
    getProject: builder.query({
      query: (id) => `/projects/${id}`,
      transformResponse: (res) => res?.data || null,
      providesTags: (result, error, id) => [{ type: 'Project', id }],
    }),
    createProject: builder.mutation({
      query: (body) => ({ url: '/projects', method: 'POST', body }),
      invalidatesTags: [{ type: 'Projects', id: 'LIST' }],
    }),
    deleteProject: builder.mutation({
      query: (id) => ({ url: `/projects/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Projects', id: 'LIST' }],
    }),
    moveTask: builder.mutation({
      query: ({ taskId, ...body }) => ({
        url: `/projects/tasks/${taskId}/move`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: 'Project', id: projectId },
      ],
    }),
  }),
})

export const {
  useListProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useMoveTaskMutation,
} = projectsApi
