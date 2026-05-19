import { useEffect, ComponentType } from "react";
import { useNavigate } from "react-router-dom";

function withAuth<T extends object>(WrappedComponent: ComponentType<T>) {
  const AuthComponent = (props: T) => {
    const navigate = useNavigate();

    useEffect(() => {
      if (!localStorage.getItem("token")) {
        navigate("/auth");
      }
    }, [navigate]);

    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
}

export default withAuth;
