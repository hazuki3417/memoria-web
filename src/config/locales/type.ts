// NOTE: 言語スキーマの型定義
export type TranslationSchema = {
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
