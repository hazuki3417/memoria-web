import { TranslationSchema } from "./type"

export const en: TranslationSchema = {
  button: {
    group: "Group",
    search: "Search",
    new: "New",
    delete: "Delete",
    edit: "Edit",
    download: "Download",
    create: "Create",
    update: "Update",
    register: "Register",
    add: "Add",
    remove: "Remove",
    replace: "Replace",
  },
  placeholder: {
    tag: "Tag",
    group: "Group name",
  },
  label: {
    list: "List",
    group: "Group",
    filter: "Filter",
    bulk: "Bulk",
  },
  auth: {
    signIn: "Sign in",
    signUp: "Sign up",
    signOut: "Sign out",
  },
  hello: "Good morning",
  validate: {
    file: {
      size: {
        tooLarge:
          "The file size exceeds the maximum allowed {{maxSize}}{{unit}}.",
        tooSmall:
          "The file size is below the minimum required {{minSize}}{{unit}}.",
        unreadable: "Failed to read the file size.",
      },
      type: {
        unsupported: "This file format {{ext}} is not supported.",
        invalid: "Invalid file format.",
        missing: "Could not determine the file format.",
      },
      tooManyFiles: "You can upload up to {{max}} files only.",
    },
  },
}
