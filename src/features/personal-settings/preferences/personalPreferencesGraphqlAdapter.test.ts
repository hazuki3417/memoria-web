import { describe, expect, it } from "vitest"
import {
  DateFormat,
  FileSizeUnit,
  MediaThumbnailSize,
} from "@/infrastructure/graphql/generated"
import {
  fromGraphqlPersonalPreferences,
  toGraphqlPersonalPreferencesPatch,
} from "./personalPreferencesGraphqlAdapter"
import { defaultPersonalPreferences } from "./personalPreferences"

describe("Personal PreferencesのGraphQL変換", () => {
  it("converts all account-synchronized preferences from GraphQL", () => {
    expect(
      fromGraphqlPersonalPreferences({
        personalAccentColor: "#4287F5",
        dateFormat: DateFormat.DdMmYyyy,
        fileSizeUnit: FileSizeUnit.Binary,
        mediaThumbnailSize: MediaThumbnailSize.Large,
        mediaDetailNavigationWrap: true,
        mediaDetailInitialInfoWide: false,
        mediaDetailInitialInfoMedium: true,
      }),
    ).toEqual({
      ...defaultPersonalPreferences,
      personalAccentColor: "#4287F5",
      dateFormat: "DD_MM_YYYY",
      fileSizeUnit: "BINARY",
      mediaThumbnailSize: "LARGE",
      mediaDetailNavigationWrap: true,
      mediaDetailInitialInfoWide: false,
      mediaDetailInitialInfoMedium: true,
    })
  })

  it("converts changed enum values and preserves scalar changes", () => {
    expect(
      toGraphqlPersonalPreferencesPatch({
        personalAccentColor: "#4287F5",
        dateFormat: "MM_DD_YYYY",
        fileSizeUnit: "BINARY",
        mediaThumbnailSize: "SMALL",
        mediaDetailNavigationWrap: false,
      }),
    ).toEqual({
      personalAccentColor: "#4287F5",
      dateFormat: DateFormat.MmDdYyyy,
      fileSizeUnit: FileSizeUnit.Binary,
      mediaThumbnailSize: MediaThumbnailSize.Small,
      mediaDetailNavigationWrap: false,
    })
  })

  it("does not introduce unrelated edits into a partial update", () => {
    const patch = toGraphqlPersonalPreferencesPatch({
      personalAccentColor: "#123456",
    })
    expect(patch.personalAccentColor).toBe("#123456")
    expect(patch.fileSizeUnit).toBeUndefined()
    expect(patch.dateFormat).toBeUndefined()
    expect(patch.mediaThumbnailSize).toBeUndefined()
    expect(patch.mediaDetailNavigationWrap).toBeUndefined()
  })

  it("supports every enum option", () => {
    for (const value of ["YYYY_MM_DD", "MM_DD_YYYY", "DD_MM_YYYY"] as const) {
      expect(
        toGraphqlPersonalPreferencesPatch({ dateFormat: value }).dateFormat,
      ).toBe(value)
    }
    for (const value of ["DECIMAL", "BINARY"] as const) {
      expect(
        toGraphqlPersonalPreferencesPatch({ fileSizeUnit: value }).fileSizeUnit,
      ).toBe(value)
    }
    for (const value of ["SMALL", "MEDIUM", "LARGE"] as const) {
      expect(
        toGraphqlPersonalPreferencesPatch({ mediaThumbnailSize: value })
          .mediaThumbnailSize,
      ).toBe(value)
    }
  })
})
