type FormInputProps = {
  className: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  id: string
  value: string
};

export default function FormInput({className, onChange, placeholder, id, value}: FormInputProps){
  return (
    <input className={className} type="text" onChange={onChange} placeholder={placeholder} value={value} id={id}/>
  )
}