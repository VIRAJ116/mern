import { DataTable } from '@/components/common/data-table'
import React from 'react'

const Dashboard = () => {
  const userColumns = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue('name')}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <div className="capitalize px-2 py-1 rounded-full bg-primary/10 text-primary text-xs w-fit">
          {row.getValue('status')}
        </div>
      ),
    },
  ]
  const users = [
    { name: 'John Doe', status: 'active' },
    { name: 'Jane Smith', status: 'pending' },
  ]
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <DataTable columns={userColumns} data={users} searchKey="name" />
    </div>
  )
}

export default Dashboard
