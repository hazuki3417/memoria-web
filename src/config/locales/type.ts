// NOTE: 言語スキーマの型定義
export type TranslationSchema = {
  button: {
    group: string
    search: string
    new: string
    delete: string
    edit: string
    download: string
    create: string
    update: string
    register: string
    add: string
    remove: string
    replace: string
  }
  placeholder: {
    tag: string
    group: string
  }
  label: {
    list: string
    group: string
    view: string
    action: string
  }
  auth: {
    signIn: string
    signUp: string
    signOut: string
  }
  hello: string
  validate: {
    file: {
      size: {
        tooLarge: string
        tooSmall: string
        unreadable: string
      }
      type: {
        unsupported: string
        invalid: string
        missing: string
      }
      tooManyFiles: string
    }
  }
}
