import { useEffect, useState } from "react";
import { AxiosError } from "axios";

import ContentContainer from "../../components/ui/ContentContainer";
import Dialog from "../../components/ui/Dialog";
import FormInput from "../../components/ui/FormInput";
import StatusModal from "../../components/ui/StatusModal";
import { employeeAccount } from "../../service/api/root/employeeAccountService";

import { FaImages, FaSave, FaCheckCircle } from "react-icons/fa";
import { MdDelete, MdOutlineReportGmailerrorred } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";

export default function RegisterEmployee() {
  const [savingDialog, setSavingDialog] = useState(false);
  const [clearingDialog, setClearingDialog] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<boolean | string>(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    phone: "",
    suffix: "",
    salutations: "",
    sex: "Male",
    profile_image: "" as File | string,
    username: "",
    password: "",
  });

  const validateInput = (data: typeof formData) => {
    // List required keys (skipping optional fields if any, e.g., middle_name / suffix)
    const requiredKeys: (keyof typeof formData)[] = [
      "first_name",
      "last_name",
      "email",
      "username",
      "password",
    ];

    return requiredKeys.every((key) => Boolean(data[key]));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, id, value, type } = e.target;
    const fieldKey = name || id;

    if (type === "file" || fieldKey === "profile_image") return;

    setFormData((prev) => ({
      ...prev,
      [fieldKey]: value,
    }));
  };

  const onDelete = () => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
    setFormData((prev) => ({
      ...prev,
      profile_image: "",
    }));
    setPreviewImage("");
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      setFormData((prev) => ({
        ...prev,
        profile_image: file,
      }));

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
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
    setFormData({
      first_name: "",
      middle_name: "",
      last_name: "",
      email: "",
      phone: "",
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
    if (!validateInput(formData)) {
      setSavingDialog(false);
      setError("Please fill in all the required fields.");
      return;
    }

    const form = new FormData();
    form.append("email", formData.email);
    form.append("phone", formData.phone);
    form.append("first_name", formData.first_name);
    form.append("last_name", formData.last_name);
    form.append("middle_name", formData.middle_name);
    form.append("password", formData.password);
    form.append("salutations", formData.salutations);
    form.append("sex", formData.sex);
    form.append("suffix", formData.suffix);
    form.append("username", formData.username);

    const rawImage = formData.profile_image;
    if (rawImage && rawImage instanceof File) {
      form.append("profile_image", rawImage, rawImage.name);
    }

    try {
      setSavingDialog(false);
      setLoading(true);
      await employeeAccount.registerEmployee(form);
      setSuccess(true);
      setLoading(false);
      clearInput();
    } catch (err) {
      setLoading(false);
      if (err instanceof AxiosError) {
        setError(
          err.response?.data?.message ||
            "An error occurred during registration.",
        );
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <>
      <ContentContainer className={"flex py-5 px-5 bg-white relative"}>
        {/* ASIDE - LEFT SIDE */}
        <aside className="w-[30%] h-full pr-5 border-r-2 border-gray-300">
          <h1 className="font-semibold text-base text-gray-700">
            Account Management
          </h1>
          <div className="mt-2 w-full h-48 border-2 border-dashed rounded-md border-gray-300 bg-gray-50 overflow-hidden">
            {previewImage ? (
              <PreviewPanel onDelete={onDelete} image={previewImage} />
            ) : (
              <UploadPanel />
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              e.stopPropagation();
              handleImageUpload(e);
            }}
            className="mt-2 block w-full h-9 text-sm text-gray-500
              file:mr-4 file:py-1.5 file:px-4
              file:rounded-md file:border-0
              file:text-xs file:font-semibold
              file:bg-gray-200 file:text-gray-700
              hover:file:bg-gray-300 file:cursor-pointer
              cursor-pointer bg-gray-50 rounded-md border border-gray-300"
          />

          <h2 className="mt-6 font-semibold text-base text-gray-700">
            Account Credentials
          </h2>
          <div className="space-y-3 mt-2">
            <CredentialsInput
              label="Username:"
              type="text"
              id="username"
              value={formData.username}
              placeholder="Enter employee's username."
              handleGenerate={() =>
                setFormData((prev) => ({
                  ...prev,
                  username: `user_${Math.floor(1000 + Math.random() * 9000)}`,
                }))
              }
              onChange={handleChange}
            />
            <CredentialsInput
              label="Password:"
              type="password"
              id="password"
              value={formData.password}
              placeholder="Enter employee's password."
              handleGenerate={() =>
                setFormData((prev) => ({
                  ...prev,
                  password: Math.random().toString(36).slice(-8),
                }))
              }
              onChange={handleChange}
            />
          </div>
        </aside>

        {/* MAIN - RIGHT SIDE */}
        <main className="w-[70%] h-full ml-6 flex flex-col justify-between">
          <div>
            <h2 className="font-semibold text-base text-gray-700">
              Employee Information
            </h2>
            <div className="grid grid-cols-2 gap-4 w-full mt-3">
              <FormInput
                id="first_name"
                value={formData.first_name}
                className="w-full h-9 bg-white border border-gray-300 font-medium text-sm px-3 rounded-md focus:border-blue-500 focus:outline-none"
                onChange={handleChange}
                placeholder="First Name *"
              />
              <FormInput
                id="middle_name"
                value={formData.middle_name}
                className="w-full h-9 bg-white border border-gray-300 font-medium text-sm px-3 rounded-md focus:border-blue-500 focus:outline-none"
                onChange={handleChange}
                placeholder="Middle Name"
              />
              <FormInput
                id="last_name"
                value={formData.last_name}
                className="w-full h-9 bg-white border border-gray-300 font-medium text-sm px-3 rounded-md focus:border-blue-500 focus:outline-none"
                onChange={handleChange}
                placeholder="Last Name *"
              />

              <div className="flex gap-2">
                <Dropdown
                  input_name="suffix"
                  value={formData.suffix}
                  choice={["Jr", "Sr", "III", "IV"]}
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
                  choice={["Male", "Female", "Other"]}
                  onChange={handleChange}
                  title="Sex"
                />
              </div>
            </div>

            <h2 className="font-semibold text-base text-gray-700 mt-8">
              Employee Contacts
            </h2>
            <div className="grid grid-cols-2 gap-4 w-full mt-3">
              <FormInput
                id="email"
                value={formData.email}
                className="w-full h-9 bg-white border border-gray-300 font-medium text-sm px-3 rounded-md focus:border-blue-500 focus:outline-none"
                onChange={handleChange}
                placeholder="Email Address *"
              />
              <FormInput
                id="phone"
                value={formData.phone}
                className="w-full h-9 bg-white border border-gray-300 font-medium text-sm px-3 rounded-md focus:border-blue-500 focus:outline-none"
                onChange={handleChange}
                placeholder="Phone Number"
              />
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-3 mt-8 text-white pt-4 border-t border-gray-200">
            <button
              type="button"
              className="w-28 h-10 rounded-md flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 font-medium text-sm transition-colors cursor-pointer"
              onClick={handleClear}
            >
              <MdDelete size={18} />
              Clear
            </button>
            <button
              type="button"
              className="w-28 h-10 rounded-md flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 font-medium text-sm transition-colors cursor-pointer"
              onClick={handleSave}
            >
              <FaSave size={18} />
              Save
            </button>
          </div>
        </main>

        {/* DIALOGS & MODALS */}
        {savingDialog && (
          <Dialog
            isOpen={savingDialog}
            onClose={() => setSavingDialog(false)}
            onConfirm={registerEmployee}
            heading="Confirm Changes"
            description="Are you sure you want to save these changes to the employee profile?"
            confirmText="Save Changes"
            cancelText="Cancel"
            confirmColor="bg-emerald-600 hover:bg-emerald-700 text-white"
            icon={<FaSave size={40} className="text-emerald-600" />}
          />
        )}

        {clearingDialog && (
          <Dialog
            isOpen={clearingDialog}
            onClose={() => setClearingDialog(false)}
            onConfirm={clearInput}
            heading="Clear Changes?"
            description="Are you sure you want to clear all form fields?"
            confirmText="Clear Form"
            cancelText="Cancel"
            confirmColor="bg-red-600 hover:bg-red-700 text-white"
            icon={<MdDelete size={40} className="text-red-600" />}
          />
        )}

        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="flex flex-col items-center gap-3 rounded-xl bg-white px-8 py-6 shadow-lg">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600" />
              <p className="text-sm font-medium text-gray-700">
                Saving Employee...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <StatusModal
              heading="An Error Has Occurred"
              description={error.toString()}
              icon={
                <MdOutlineReportGmailerrorred
                  size={45}
                  className="text-red-600"
                />
              }
              button_color="bg-red-600 hover:bg-red-700"
              button_name="Close"
              onClick={() => setError(false)}
            />
          </div>
        )}

        {success && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <StatusModal
              heading="Registration Successful"
              description="Employee account was successfully created!"
              icon={<FaCheckCircle size={45} className="text-emerald-600" />}
              button_color="bg-emerald-600 hover:bg-emerald-700"
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
    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
      <FaImages size={36} className="text-gray-400 mb-2" />
      <p className="text-xs font-medium text-gray-700">
        Upload Profile Picture
      </p>
      <p className="text-[11px] text-gray-500 mt-0.5">
        PNG or JPG files accepted.
      </p>
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
    <div className="w-full h-full flex items-center justify-center p-2 relative bg-gray-100">
      <button
        type="button"
        className="w-7 h-7 rounded-full bg-gray-800/70 hover:bg-gray-900 text-white absolute right-2 top-2 flex items-center justify-center cursor-pointer transition-colors"
        onClick={onDelete}
      >
        <RxCross2 size={16} />
      </button>
      <img
        src={image}
        alt="Employee Preview"
        className="max-h-full max-w-full object-contain rounded-md"
      />
    </div>
  );
}

type CredentialsInputType = {
  label: string;
  id: string;
  value: string;
  placeholder: string;
  type: string;
  handleGenerate: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function CredentialsInput({
  label,
  id,
  value,
  placeholder,
  type,
  handleGenerate,
  onChange,
}: CredentialsInputType) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-xs font-semibold text-gray-600 uppercase tracking-wider"
      >
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type={type}
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="h-9 w-full px-3 rounded-md border border-gray-300 bg-white text-xs text-gray-800 focus:outline-none focus:border-blue-500"
        />
        <button
          type="button"
          className="h-9 px-3 shrink-0 rounded-md border border-gray-300 bg-gray-100 hover:bg-gray-200 font-medium text-xs text-gray-700 transition cursor-pointer"
          onClick={handleGenerate}
        >
          Generate
        </button>
      </div>
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
  return (
    <div className="flex flex-col gap-1 flex-1">
      <select
        id={input_name}
        name={input_name}
        value={value}
        onChange={onChange}
        className="h-9 px-2 rounded-md border border-gray-300 bg-white text-xs text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer"
      >
        <option value="" disabled>
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
