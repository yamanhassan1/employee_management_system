import { useMemo, useState } from 'react'

export function usePagination({ total = 0, initialPage = 1, initialLimit = 20 } = {}) {
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)

  const totalPages = useMemo(() => Math.max(Math.ceil(total / limit), 1), [total, limit])

  const nextPage = () => setPage((p) => Math.min(p + 1, totalPages))
  const prevPage = () => setPage((p) => Math.max(p - 1, 1))
  const goToPage = (p) => setPage(Math.min(Math.max(p, 1), totalPages))

  return {
    page,
    limit,
    totalPages,
    setPage,
    setLimit,
    nextPage,
    prevPage,
    goToPage,
    offset: (page - 1) * limit,
  }
}
