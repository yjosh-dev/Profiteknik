import AuthProvider from "./AuthProvider";

type ContextProviderProps = {
  children: React.ReactNode;
};

export default function ContextProvider({ children }: ContextProviderProps) {
  return (
      <AuthProvider>{children}</AuthProvider>
  );
}
