"use client";
import { UserProvider, UserProviderProps } from "@auth0/nextjs-auth0/client";
import { FC } from "react";

type Props = Pick<UserProviderProps, "children">;

const AuthProvider: FC<Props> = (props) => {
	const { children } = props;
	return <UserProvider>{children}</UserProvider>;
};

export default AuthProvider;
