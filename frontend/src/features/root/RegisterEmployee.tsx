import { useEffect, useState } from "react";
import { AxiosError } from "axios";

import ContentContainer from "../../components/ui/ContentContainer";
import Dialog from "../../components/ui/Dialog";

import { FaImages } from "react-icons/fa";
import { FaChevronUp, FaChevronDown, FaSave, FaCheckCircle } from "react-icons/fa";
import { MdDelete, MdOutlineReportGmailerrorred } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";

import FormInput from "../../components/ui/FormInput";

import { employeeAccount } from "../../service/api/root/employeeAccountService";
import StatusModal from "../../components/ui/StatusModal";

export default function RegisterEmployee() {
  const [savingDialog, setSavingDialog] = useState(false);
  const [clearingDialog, setClearingDialog] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<boolean | string>(false);
  const [incompleteInput, setIncompleteInput] = useState(true);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<{
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
    suffix: string;
    salutations: string;
    sex: string;
    profile_image: File | string;
    username: string;
    password: string;
  }>({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    suffix: "",
    salutations: "",
    sex: "Male",
    profile_image: "",
    username: "",
    password: "",
  });

  const validateInput = (data: Record<string, any>) => {
    const hasEmptyField = Object.values(data).some(
      (value) => value === "" || value === null || value === undefined,
    );

    if (hasEmptyField) {
      return false;
    } else {
      return true;
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, id, value, type } = e.target;

    if (type === "file" || (name || id) === "profile_image") return;

    setFormData((prev) => ({
      ...prev,
      [name || id]: value,
    }));
  };

  useEffect(() => {}, [incompleteInput]);

  const onDelete = () => {
    setFormData({
      ...formData,
      profile_image: "",
    });
    setPreviewImage("");
  };
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      // 1. Set raw binary file in form state
      setFormData((prev) => ({
        ...prev,
        profile_image: file,
      }));

      // 2. Set preview string in preview state
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
    }
  };

  const handleSave = () => {
    setSavingDialog(true);
  };

  const handleClear = () => {
    setClearingDialog(true);
  };

  const clearInput = () => {
    setFormData({
      first_name: "",
      middle_name: "",
      last_name: "",
      email: "",
      suffix: "",
      salutations: "",
      sex: "Male",
      profile_image: "",
      username: "",
      password: "",
    });

    setPreviewImage("");

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
    setClearingDialog(false);
  };

  const registerEmployee = async () => {
    if (validateInput(formData)) {
      console.log("Complete");
    } else {
      console.log("Incomplete");
      return;
    }
    const form = new FormData();
    form.append("email", formData.email);
    form.append("first_name", formData.first_name);
    form.append("last_name", formData.last_name);
    form.append("middle_name", formData.middle_name);
    form.append("password", formData.password);
    form.append("salutations", formData.salutations);
    form.append("sex", formData.sex);
    form.append("suffix", formData.suffix);
    form.append("username", formData.username);

    const rawImage = formData.profile_image as any;

    if (rawImage && rawImage instanceof File) {
      form.append("profile_image", rawImage, rawImage.name);
    } else {
      console.warn("formData.profile_image is NOT a File instance:", rawImage);
    }

    try {
      setSavingDialog(false);
      setLoading(true);
      const response = await employeeAccount.registerEmployee(form);
      setSuccess(true);
      setLoading(false)
      clearInput();
    } catch (error) {
      setLoading(false);
      if (error instanceof AxiosError) {
        setError(error.response?.data?.message);
        console.error("API Error Response:", error.response?.data);
        console.error("Status Code:", error.response?.status);
      } else {
        console.error("Unexpected Error:", error);
      }
    }
  };

  return (
    <>
      <ContentContainer className={"flex py-5 px-5 bg-white"}>
        <aside className="w-[30%] h-full pr-5 border-r-2  border-gray-400 ">
          <h1 className="font-semibold text-base text-gray-600">
            Account Management
          </h1>
          <div className="mt-2 w-full h-[40%] border-3 rounded-md border-gray-300 bg-gray-200">
            {previewImage ? (
              <PreviewPanel onDelete={onDelete} image={previewImage} />
            ) : (
              <UploadPanel />
            )}
          </div>
          <input
            type="file"
            onChange={(e) => {
              e.stopPropagation(); // Prevents generic form handlers from running
              handleImageUpload(e);
            }}
            className="mt-2 block w-full h-9 text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
        file:bg-gray-200 file:text-gray-700
        hover:file:bg-gray-300 file:cursor-pointer
          cursor-pointer bg-gray-100 rounded-md border border-gray-300"
          />
          <h2 className="mt-5 font-semibold text-base text-gray-600">
            Account Credentials
          </h2>
          <form>
            <CredentialsInput
              label="Username:"
              type="text"
              id="username"
              placeholder="Enter employee's username."
              handleGenerate={() => alert(formData.username)}
              onChange={handleChange}
            />
            <CredentialsInput
              label="Password:"
              type="text"
              id="password"
              placeholder="Enter employee's password."
              handleGenerate={() => alert(formData.password)}
              onChange={handleChange}
            />
          </form>
        </aside>
        <main className="w-[65%] h-full ml-5">
          <div className="w-full h-[90%] ">
            <h2 className="font-semibold text-base text-gray-600">
              Employee Information
            </h2>
            <div className="mt-3">
              <form className="grid grid-cols-2 gap-5 w-full mt-3">
                <FormInput
                  id="first_name"
                  value={formData.first_name}
                  className="w-full h-8 bg-white border border-gray-400 font-medium text-base px-3 rounded-md"
                  onChange={handleChange}
                  placeholder="First Name"
                />
                <FormInput
                  id="middle_name"
                  value={formData.middle_name}
                  className="w-full h-8 bg-white border border-gray-400 font-medium text-base px-3  rounded-md"
                  onChange={handleChange}
                  placeholder="Middle Name"
                />
                <FormInput
                  id="last_name"
                  value={formData.last_name}
                  className="w-full h-8 bg-white border border-gray-400 font-medium text-base px-3 rounded-md"
                  onChange={handleChange}
                  placeholder="Last Name"
                />
                <div className="flex justify-between">
                  <Dropdown
                    input_name="suffix"
                    value={formData.suffix}
                    choice={["Jr", "Sr", "Other"]}
                    onChange={handleChange}
                    title="Suffix"
                  />
                  <Dropdown
                    input_name="salutations"
                    value={formData.salutations}
                    title="Salutations"
                    choice={["Mr.", "Ms.", "Mrs."]}
                    onChange={handleChange}
                  />
                  <Dropdown
                    input_name="sex"
                    value={formData.sex}
                    choice={["Male", "Female", "other"]}
                    onChange={handleChange}
                    title="Sex"
                  />
                </div>             
              </form>
            </div>
            <h2 className="font-semibold text-base text-gray-600 mt-10">
              Employee Contacts
            </h2>
            <div className="mt-3">
              <form className="grid grid-cols-2 gap-5 w-full mt-3">
                <FormInput
                  id="email"
                  value={formData.email}
                  className="w-full h-8 bg-white border border-gray-400 font-medium text-base px-3 rounded-md "
                  onChange={handleChange}
                  placeholder="Email"
                />
                <FormInput
                  id="email"
                  value={formData.email}
                  className="w-full h-8 bg-white border border-gray-400 font-medium text-base px-3 rounded-md col-"
                  onChange={handleChange}
                  placeholder="Phone no."
                />
              </form>
            </div>
          </div>
          <div className="flex gap-3 absolute right-15 text-white ">
            <button
              className="w-24 h-10 rounded-sm flex items-center justify-center gap-2 bg-red-600/80 border border-red-200 hover:bg-red-400"
              onClick={() => handleClear()}
            >
              <MdDelete size={20} />
              Clear
            </button>
            <button
              className="w-24 h-10 rounded-sm flex items-center justify-center gap-2 bg-green-600/80 border border-green-200 hover:bg-green-400"
              onClick={() => handleSave()}
            >
              <FaSave size={20} />
              Save
            </button>
          </div>
        </main>

        {savingDialog && (
          <Dialog
            isOpen={savingDialog}
            onClose={() => setSavingDialog(false)}
            onConfirm={registerEmployee}
            heading="Confirm Changes"
            description="Are you sure you want to save these changes to the employee profile?"
            confirmText="Save Changes"
            cancelText="Cancel"
            confirmColor="bg-green-600 hover:bg-green-400 text-white"
            icon={<FaSave size={40} />}
          />
        )}

        {clearingDialog && (
          <Dialog
            isOpen={clearingDialog}
            onClose={() => setClearingDialog(false)}
            onConfirm={clearInput}
            heading="Clear Changes?"
            description="Are you sure you want to clear all the input?"
            confirmText="Clear"
            cancelText="Cancel"
            confirmColor="bg-green-600 hover:bg-green-400 text-white"
            icon={<FaSave size={40} />}
          />
        )}

        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="flex flex-col items-center gap-3 rounded-xl bg-white px-8 py-6 shadow-lg">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" />
              <p className="text-sm font-medium text-gray-700">Loading...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <StatusModal
              heading="An error has occured"
              description={error.toString()}
              icon={<MdOutlineReportGmailerrorred size={45} />}
              button_color="bg-[#FF0000]"
              button_name="Close"
              onClick={() => setError(false)}
            />
          </div>
        )}

        {success && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <StatusModal
              heading="Registration Successful"
              description="Employee account successfully created!"
              icon={<FaCheckCircle  size={45} />}
              button_color="bg-[#008000]"
              button_name="Close"
              onClick={() => setSuccess(false)}
            />
          </div>
        )}

      </ContentContainer>
    </>
  );
}

function UploadPanel() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
      <FaImages size={45} color="A8A492" />
      <div>
        <p className="text-sm font-medium text-center">
          Upload the employee's profile picture here.
        </p>
        <p className="text-xs text-gray-600">
          Click the button or drag the image to upload it properly.
        </p>
      </div>
    </div>
  );
}

function PreviewPanel({
  image,
  onDelete,
}: {
  image: string;
  onDelete: () => void;
}) {
  return (
    <div className="w-full h-full flex items-center justify-center px-3 py-3 relative">
      <div
        className="w-8 h-8 rounded-full bg-gray-400 absolute right-2 top-2 flex items-center justify-center"
        onClick={onDelete}
      >
        <RxCross2 />
      </div>
      <img src={image} className="w-[60%] h-[80%]" />
    </div>
  );
}

type CredentialsInputType = {
  label: string;
  id: string;
  placeholder: string;
  type: string;
  handleGenerate: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function CredentialsInput({
  label,
  id,
  placeholder,
  type,
  handleGenerate,
  onChange,
}: CredentialsInputType) {
  return (
    <div className="mt-2 grid grid-cols-[1fr_auto] gap-1 items-center">
      {/* Label spans both columns */}
      <label className="col-span-2 text-base font-medium text-gray-500">
        {label}
      </label>

      {/* Input fills the first column */}
      <input
        type={type}
        id={id}
        onChange={onChange}
        placeholder={placeholder}
        className="h-9 px-2 rounded-md border-2 bg-white text-xs border-gray-300 focus:outline-none focus:border-blue-500"
      />

      {/* Button sits in the second column beside the input */}
      <button
        type="button"
        className="h-9 px-4 rounded-md border-2 border-gray-300 bg-gray-100 hover:bg-gray-200 font-medium text-sm transition"
        onClick={handleGenerate}
      >
        Generate
      </button>
    </div>
  );
}

type DropdownType = {
  choice: string[];
  input_name: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  value: string;
  title: string;
};

function Dropdown({
  choice,
  input_name,
  onChange,
  value,
  title,
}: DropdownType) {
  const [isActive, setIsActive] = useState(false);
  const [selected, setSelected] = useState();
  return (
    <div className="flex flex-col gap-1 w-[30%] h-8">
      <select
        id={input_name}
        name={input_name}
        value={value}
        defaultValue="" // Binds selected option to state
        onChange={onChange} // Triggers state update on selection change
        className="h-9 px-3 rounded-md border-2 border-gray-300 bg-white text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer"
      >
        <option value="" disabled hidden>
          {title}
        </option>
        {choice.map((item, index) => (
          <option key={index} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}
