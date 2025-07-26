'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { adminApi } from '@/services/api-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Department } from '@/types'
import { useToast } from '@/components/ui/toast-provider'

export default function DepartmentManagement() {
  const { data: session } = useSession()
  const { success, error:ToastError } = useToast()
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    headOfDepartment: ''
  })

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await adminApi.getAllDepartments()
      setDepartments(data)
    } catch (error: any) {
      console.error('Error fetching departments:', error)
      setError('Failed to load departments')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setError(null)
      
      if (editingDepartment) {
        await adminApi.updateDepartment(editingDepartment.id, formData)
        success('Department updated successfully')
      } else {
        await adminApi.createDepartment(formData)
        success('Department created successfully')
      }
      
      setShowCreateForm(false)
      setEditingDepartment(null)
      resetForm()
      await fetchDepartments()
    } catch (error: any) {
      console.error('Error saving department:', error)
      setError(editingDepartment ? 'Failed to update department' : 'Failed to create department')
      error(editingDepartment ? 'Failed to update department' : 'Failed to create department')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this department?')) return
    
    try {
      setError(null)
      await adminApi.deleteDepartment(id)
      success('Department deleted successfully')
      await fetchDepartments()
    } catch (error: any) {
      console.error('Error deleting department:', error)
      setError('Failed to delete department')
      ToastError('Failed to delete department')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      headOfDepartment: ''
    })
  }

  const openEditForm = (department: Department) => {
    setEditingDepartment(department)
    setFormData({
      name: department.name,
      code: department.code,
      description: department.description || '',
      headOfDepartment: department.headOfDepartment || ''
    })
    setShowCreateForm(true)
  }

  const openCreateForm = () => {
    setEditingDepartment(null)
    resetForm()
    setShowCreateForm(true)
  }

  const closeForm = () => {
    setShowCreateForm(false)
    setEditingDepartment(null)
    resetForm()
    setError(null)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Department Management</h1>
        {session?.user?.role === 'ADMIN' && (
          <Button onClick={openCreateForm} className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            Create Department
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingDepartment ? 'Edit Department' : 'Create New Department'}
            </CardTitle>
            <CardDescription>
              {editingDepartment ? 'Update department information' : 'Add a new department to the system'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">Name</label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Department name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="code" className="block text-sm font-medium mb-2">Code</label>
                  <Input
                    id="code"
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Department code"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="headOfDepartment" className="block text-sm font-medium mb-2">Head of Department</label>
                <Input
                  id="headOfDepartment"
                  type="text"
                  value={formData.headOfDepartment}
                  onChange={(e) => setFormData({ ...formData, headOfDepartment: e.target.value })}
                  placeholder="Head of department name"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Department description"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit">
                  {editingDepartment ? 'Update Department' : 'Create Department'}
                </Button>
                <Button type="button" variant="outline" onClick={closeForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {departments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No departments found. Create your first department to get started.</p>
            </CardContent>
          </Card>
        ) : (
          departments.map((department) => (
            <Card key={department.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {department.name}
                      <span className="text-sm font-normal text-gray-500">({department.code})</span>
                    </CardTitle>
                    <CardDescription>{department.description}</CardDescription>
                    {department.headOfDepartment && (
                      <p className="text-sm text-gray-600 mt-1">Head: {department.headOfDepartment}</p>
                    )}
                  </div>
                  {session?.user?.role === 'ADMIN' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditForm(department)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(department.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
