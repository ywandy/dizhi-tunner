import {
  defaultPreferences,
  loadPreferences,
  preferencesStorageKey,
  savePreferences,
} from './preferences'

describe('preferences storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('saves and restores valid dizi tuner preferences', () => {
    savePreferences({
      diziKey: 'G',
      mode: 'target',
      targetLabel: '高音1',
    })

    expect(JSON.parse(localStorage.getItem(preferencesStorageKey) ?? '{}')).toEqual({
      diziKey: 'G',
      mode: 'target',
      targetLabel: '高音1',
    })
    expect(loadPreferences()).toEqual({
      diziKey: 'G',
      mode: 'target',
      targetLabel: '高音1',
    })
  })

  it('falls back to defaults for missing or invalid preferences', () => {
    expect(loadPreferences()).toEqual(defaultPreferences)

    localStorage.setItem(
      preferencesStorageKey,
      JSON.stringify({
        diziKey: 'Z',
        mode: 'target',
        targetLabel: '不存在',
      }),
    )

    expect(loadPreferences()).toEqual(defaultPreferences)
  })
})
