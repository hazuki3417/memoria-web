// NOTE: 言語スキーマの型定義
export type TranslationSchema = {
  button: {
    search: string;
    new: string;
    delete: string;
    edit: string;
    download: string;
  };
  placeholder: {
    tag: string
  },
  label: {
    list: string,
    group: string,
    filter: string;
    bulk: string;
  };
  auth: {
    signIn: string;
    signUp: string;
    signOut: string;
  };
  hello: string;
  validate: {
    file: {
      size: {
        tooLarge: string;
        tooSmall: string;
        unreadable: string;
      };
      type: {
        unsupported: string;
        invalid: string;
        missing: string;
      };
      tooManyFiles: string;
    };
  };
};
