import { useLang } from "@/lib/cookies/lang/useLang";
import { Combobox, InputBase, Text, useCombobox } from "@mantine/core";
import { IconLanguage } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

const langs = ["JA", "EN"];

export interface LangSelectProps {}

export const LangSelect = (props: LangSelectProps) => {
  const {} = props;

  const router = useRouter();
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const lang = useLang();

  const options = useMemo(() => {
    return langs.map((code) => (
      <Combobox.Option
        value={code}
        key={code}
        active={code.toLowerCase() === lang.state.value}
      >
        <Text size="xs">{code}</Text>
      </Combobox.Option>
    ));
  }, [langs]);

  const onOptionSubmit = useCallback(
    (value: string) => {
      lang.handler.set(value.toLowerCase());
      combobox.closeDropdown();
      router.refresh();
    },
    [combobox],
  );

  return (
    <Combobox size="xs" store={combobox} onOptionSubmit={onOptionSubmit}>
      <Combobox.Target>
        <InputBase
          size="xs"
          w={60}
          pointer
          leftSection={<IconLanguage />}
          rightSectionPointerEvents="none"
          value={lang.state.value.toUpperCase()}
          onClick={() => combobox.toggleDropdown()}
          readOnly
        />
      </Combobox.Target>
      <Combobox.Dropdown>
        <Combobox.Options>{options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};
