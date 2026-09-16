import ContentContainer from "../../components/ui/ContentContainer";
import { employeeAccount } from "../../service/api/root/employeeAccountService";

import { PiFolderUserFill } from "react-icons/pi";
import { FaSearch, FaFilter } from "react-icons/fa";
import { useEffect, useState } from "react";

export default function ManageEmployee() {
  const [employeeData, setEmployeeData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false)
  function mapApiEmployee(raw: any): Employee {
    return {
      id: raw.employee_id,
      fullName: raw.first_name + " " + raw.middle_name + " " + raw.last_name,
      email: raw.email,
      created_at: raw.created_at,
      last_login: raw.last_login,
      status: raw.status,
      profileUrl: raw.profile_image,
    };
}

  const fetchData = async () => {
    const res = await fetch("http://localhost:8000/api/root/employees");
    const data = await res.json();
    const employees: Employee[] = data.data.map(mapApiEmployee);
    setEmployeeData(employees)
  };

  useEffect(() => {
    fetchData();
  }, []);


  const [search, setSearch] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearch = () => {
    alert(search);
  };

  const handleDelete = async (id: string) => {
      try {
         setLoading(true)
         const deleteEmployee = await employeeAccount.deleteEmployee(id);
         setEmployeeData(prev => prev.filter(emp => emp.id !== id))
         setLoading(false)
      }catch(error){

      }
  }

  return (
    <ContentContainer className=" bg-white px-5 relative w-30">
      <span className="flex justify-between items-center">
        <h1 className="my-2 font-bold text-gray-600 text-base">
          Employee List
        </h1>
        <p className="text-sm font-medium">
          Last Updated: May 23, 2019, 10:30 PM{" "}
        </p>
      </span>
      <EmployeeTable
        onSearch={handleSearch}
        onChange={handleChange}
        value={search}
        employees={employeeData}
        onDelete={handleDelete}
      />
       {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="flex flex-col items-center gap-3 rounded-xl bg-white px-8 py-6 shadow-lg">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" />
              <p className="text-sm font-medium text-gray-700">Loading...</p>
            </div>
          </div>
        )}
    </ContentContainer>
  );
}

type EmployeeTableType = {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
  value?: string;
  employees?: Employee[];
  onDelete: (id: string) => void;
};

const heading = [
  "Profile",
  "Full Name",
  "Email",
  "Account Registered",
  "Last Login",
  "Status",
  "Action",
];

function EmployeeTable({
  onSearch,
  onChange,
  value,
  employees,
  onDelete
}: EmployeeTableType) {
  return (
    <div className="w-full h-[90%]">
      <div className="py-3 px-3 bg-gray-200 rounded-md flex items-center gap-3 relative">
        <div className="w-12 h-12 bg-white border-gray-400 shadow-sm rounded-md flex justify-center items-center">
          <PiFolderUserFill size="27" />
        </div>
        <p className="font-medium text-base">
          Total Employees: {employees?.length ?? 0}
        </p>
        <SearchSection
          value={value ?? ""}
          onSearch={onSearch}
          onChange={onChange}
        />
      </div>
      <TableHeader />
      {employees?.map((emp) => (
        <TableRow key={emp.id} employee={emp} onDelete={onDelete} />
      ))}
      <Pagination />
    </div>
  );
}

type SearchSelectionType = {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
  value: string;
};

function SearchSection({ onChange, value, onSearch }: SearchSelectionType) {
  return (
    // section container
    <div className=" absolute right-5 flex gap-2">
      {/** INPUT CONTAINER */}
      <div className="w-48 h-8 rounded-md border text-gray-500 shadow-sm border-gray-400 bg-white/85 text-sm font-medium px-3 flex items-center gap-2">
        <FaSearch size={16} color="#C5C1C1" />
        <input
          className="outline-none bg-transparent w-full"
          placeholder="Enter name:"
          onChange={onChange}
          value={value}
        />
      </div>
      {/** END OF INPUT CONTAINER */}
      <div className="hover:bg-gray-200 px-3 h-8 rounded-md border border-gray-400 shadow-sm flex items-center justify-center gap-2 bg-white/85">
        <FaFilter size={16} color="#C5C1C1" />
        <p className="text-gray-500 font-medium text-sm">Filter</p>
      </div>
      <div
        className="hover:bg-gray-200 px-3 h-8 rounded-md border border-gray-400 shadow-sm flex items-center justify-center gap-2 bg-white/85 cursor-pointer"
        onClick={onSearch}
      >
        <FaSearch size={16} color="#C5C1C1" />
        <p className="text-gray-500 font-medium text-sm">Search</p>
      </div>
    </div>
  );
}

function TableHeader() {
  const columns = [
    { key: "profile", label: "Profile", className: "w-30" },
    { key: "fullName", label: "Full Name", className: "flex-1" },
    { key: "email", label: "Email", className: "w-50" },
    { key: "joinDate", label: "Account Created", className: "w-40" },
    { key: "lastLogin", label: "Last Login", className: "w-40" },
    { key: "status", label: "Status", className: "w-30" },
    { key: "actions", label: "Actions", className: "w-30" },
  ];
  return (
    <div className="mt-2 mb-2 flex items-center w-full px-4 py-2 gap-2 bg-gray-200 rounded-md">
      {columns.map((col) => (
        <p
          key={col.key}
          className={`font-medium text-sm text-gray-600 ${col.className}`}
        >
          {col.label}
        </p>
      ))}
    </div>
  );
}

function Pagination() {
  return (
    <div className="w-[97%] h-12 bg-gray-200 rounded-md absolute bottom-5 flex items-center justify-center "></div>
  );
}

type Employee = {
  id: string;
  profileUrl?: string;
  fullName: string;
  email: string;
  created_at: string;
  last_login: string;
  status: "active" | "inactive" | "pending";
};

function TableRow({ employee, onDelete }: { employee: Employee, onDelete: (id: string) => void }) {
  useEffect(() => {
    console.log(employee)
  },[])
  
  const statusStyles: Record<Employee["status"], string> = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-gray-200 text-gray-600",
    pending: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="bg-gray-100 rounded-sm flex items-center w-full px-4 py-3 gap-2 border-b border-gray-100 hover:bg-gray-50 mt-2">
      <div className="w-30 flex items-center">
        <img
          src={"http://localhost:8000/storage" +"/" + employee.profileUrl}
          alt={employee.fullName}
          className="w-8 h-8 rounded-full object-cover"
        />
      </div>

      <p className="flex-8 text-sm text-gray-700 truncate">
        {employee.fullName}
      </p>

      <p className="w-50 text-sm text-gray-700 truncate">{employee.email}</p>

      <p className="w-40 text-sm text-gray-700">{employee.created_at}</p>

      <p className="w-40 text-sm text-gray-700">{employee.last_login || "N/A"}</p>

      <div className="w-30">
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${statusStyles[employee.status]}`}
        >
          {employee.status}
        </span>
      </div>

      <div className="w-30 flex items-center gap-10">
        <button className="text-xs text-blue-600 hover:underline" onClick={() => alert(employee.id)}>Edit</button>
        <button className="text-xs text-red-600 hover:underline" onClick={() => onDelete(employee.id)}>Delete</button>
      </div>
    </div>
  );
}
