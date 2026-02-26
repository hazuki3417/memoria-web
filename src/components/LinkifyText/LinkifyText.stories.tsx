import type { Meta, StoryObj } from "@storybook/react";
import { LinkifyText } from "./LinkifyText";

const meta = {
  title: "LinkifyText",
  component: LinkifyText,
} satisfies Meta<typeof LinkifyText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: "https://example.com",
  },
};

export const SingleLine: Story = {
  args: {
    text: "URL: https://example.com",
  },
};

/**
 * 改行コードの出力は提供するが、改行を表現するCSSは含まれていないので注意。
 */
export const MultiLine: Story = {
  args: {
    text: "URL: https://example.com \nURL: https://example.com \nURL: https://example.com \n",
  },
};

export const MultiURL: Story = {
  args: {
    text: "公式: https://one.example.com 代替: http://two.example.org/path",
  },
};

export const MultiByte: Story = {
  args: {
    text: "URL: http://お名前.com",
  },
};

export const Http: Story = {
  args: {
    text: "URL: http://example.com",
  },
};

export const Https: Story = {
  args: {
    text: "URL: https://example.com",
  },
};

export const QueryFragment: Story = {
  args: {
    text: "詳細: https://example.com/search?q=テスト#section2 を参照。",
  },
};

export const PortNumber: Story = {
  args: {
    text: "ローカル開発環境: http://localhost:3000/api/health チェック。",
  },
};

export const PreviousURL: Story = {
  args: {
    text: "https://example.com は公式サイトです。",
  },
};

export const BehindURL: Story = {
  args: {
    text: "詳細はこちらを御覧ください https://example.com",
  },
};

export const FrontAndRearHarfSpace: Story = {
  args: {
    text: "Visit our site at http://example.com and enjoy!",
  },
};

export const FrontAndRearFullSpace: Story = {
  args: {
    text: "こちらをご確認ください　https://example.com/テスト　ありがとうございます。",
  },
};

export const NoSpace: Story = {
  args: {
    text: "サイトはこちら：https://example.com/日本語ページをご覧ください。",
  },
};
