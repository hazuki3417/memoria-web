/**
 * validate util
 */

const file = (file: File) => {
  return {
    type: (type: string[]): boolean => type.includes(file.type),
    size: {
      tooLarge: (max: number): boolean => file.size <= max,
      tooSmall: (min: number): boolean => file.size >= min,
    },
  };
};

export const validate = {
  file,
};
