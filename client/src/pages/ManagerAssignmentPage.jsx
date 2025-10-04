// client/src/pages/ManagerAssignmentPage.jsx

import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Users, UserX, ArrowRight } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const ManagerAssignmentPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get('https://odoo-hackthon-2025-expensemanager-app.onrender.com/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (error) {
      toast.error('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAssignment = async (employeeId, managerId) => {
    const action = managerId ? 'Assigning manager...' : 'Unassigning manager...';
    const successMsg = managerId ? 'Manager assigned successfully!' : 'Manager unassigned successfully!';
    
    const promise = axios.put(
      `https://odoo-hackthon-2025-expensemanager-app.onrender.com/api/users/${employeeId}/assign-manager`,
      { managerId: managerId },
      { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
    ).then(() => fetchUsers());

    toast.promise(promise, { loading: action, success: successMsg, error: 'Action failed.' });
  };

  // Process and SORT the user list into manageable groups
  const { managers, unassignedEmployees, assignedEmployeesMap } = useMemo(() => {
    const sorter = (a, b) => a.name.localeCompare(b.name);

    const managers = users
      .filter(u => u.role === 'MANAGER' || u.role === 'ADMIN')
      .sort(sorter); // <-- SORT MANAGERS
      
    const employees = users
      .filter(u => u.role === 'EMPLOYEE')
      .sort(sorter); // <-- SORT EMPLOYEES
    
    const unassignedEmployees = employees.filter(e => !e.managerId);
    
    const assignedEmployeesMap = new Map();
    employees.forEach(e => {
      if (e.managerId) {
        if (!assignedEmployeesMap.has(e.managerId)) {
          assignedEmployeesMap.set(e.managerId, []);
        }
        assignedEmployeesMap.get(e.managerId).push(e);
      }
    });
    
    return { managers, unassignedEmployees, assignedEmployeesMap };
  }, [users]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Manager & Team Assignments</h1>
      <p className="text-muted-foreground mb-8">Visually organize your teams by assigning employees to managers.</p>
      
      {loading ? (
        <p>Loading teams...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* UNASSIGNED EMPLOYEES COLUMN */}
          <Card className="md:col-span-1">
            <CardHeader><CardTitle className="flex items-center gap-2"><UserX /> Unassigned Employees</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {unassignedEmployees.length > 0 ? (
                unassignedEmployees.map(emp => (
                  <div key={emp.id} className="flex items-center justify-between p-2 rounded-md border">
                    <div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarFallback>{emp.name.charAt(0)}</AvatarFallback></Avatar><span className="font-medium text-sm">{emp.name}</span></div>
                    <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="sm">Assign <ArrowRight className="h-4 w-4 ml-2" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {managers.map(man => (<DropdownMenuItem key={man.id} onClick={() => handleAssignment(emp.id, man.id)}>Assign to {man.name}</DropdownMenuItem>))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">All employees are assigned.</p>
              )}
            </CardContent>
          </Card>

          {/* MANAGERS & TEAMS COLUMN */}
          <div className="md:col-span-2 space-y-6">
            {managers.map(man => (
              <Card key={man.id}>
                <CardHeader><CardTitle className="flex items-center gap-2"><Users /> {man.name}'s Team <span className="text-xs font-normal px-2 py-1 bg-muted rounded-full">{man.role}</span></CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {(assignedEmployeesMap.get(man.id) || []).length > 0 ? (
                    (assignedEmployeesMap.get(man.id) || []).map(emp => (
                      <div key={emp.id} className="flex items-center justify-between p-2 rounded-md border">
                        <div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarFallback>{emp.name.charAt(0)}</AvatarFallback></Avatar><span className="font-medium text-sm">{emp.name}</span></div>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleAssignment(emp.id, null)}><UserX className="h-4 w-4" /></Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No employees assigned to this manager.</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerAssignmentPage;