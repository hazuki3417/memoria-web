export interface Input {
	id: string;
}

export interface Output {
	id: string;
	workspaceId: string;
	tags: string[];
	createdAt: string;
	updatedAt: string;
}

export interface Content {
	content: Output;
}

export interface DataResult<T> {
	loading: boolean;
  data?: T;
  error?: Error;
}
