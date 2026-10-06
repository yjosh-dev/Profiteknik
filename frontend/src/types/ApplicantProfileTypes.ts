export type ProfileForm = {
  first_name: string;
  middle_name: string;
  last_name: string;
  suffix: string;
  building_no: string;
  house_no: string;
  street: string;
  city: string;
  region: string;
  country: string;
};
 
// Step 2: contact details (POST /applicant/contact)
export type ContactForm = {
  email: string;
  phone_no: string; // international format, e.g. "+639171234567"
  tel_no: string | null;
};