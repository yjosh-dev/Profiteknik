import AuthProvider from "./authProvider";

type ContextProviderProps = {
  children: React.ReactNode;
};

export default function ContextProvider({ children }: ContextProviderProps) {
  return (
    <ContextProvider>
      <AuthProvider>{children}</AuthProvider>
    </ContextProvider>
  );
}
