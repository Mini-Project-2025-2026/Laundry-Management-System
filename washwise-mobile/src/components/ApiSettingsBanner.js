import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { colors, fonts, radius } from '../theme';
import { useApi } from '../api/client';

export default function ApiSettingsBanner() {
  const { baseUrl, setBaseUrl } = useApi();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(baseUrl);

  if (!editing) {
    return (
      <Pressable style={styles.collapsed} onPress={() => { setDraft(baseUrl); setEditing(true); }}>
        <Text style={styles.collapsedText}>
          Connected to <Text style={styles.mono}>{baseUrl}</Text> · tap to change
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.expanded}>
      <Text style={styles.label}>Backend API address</Text>
      <Text style={styles.hint}>
        Use your computer's LAN IP, not "localhost" — a phone can't reach your laptop's
        localhost. On Android emulator, use 10.0.2.2 instead of localhost.
      </Text>
      <TextInput
        style={styles.input}
        value={draft}
        onChangeText={setDraft}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="http://192.168.1.20:8080/api"
      />
      <View style={styles.row}>
        <Pressable
          style={[styles.btn, styles.btnPrimary]}
          onPress={() => { setBaseUrl(draft); setEditing(false); }}
        >
          <Text style={styles.btnPrimaryText}>Save</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.btnSecondary]} onPress={() => setEditing(false)}>
          <Text style={styles.btnSecondaryText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  collapsed: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  collapsedText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkSoft,
  },
  mono: {
    fontFamily: fonts.monoRegular,
    color: colors.steelDark,
  },
  expanded: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 14,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.ink,
    marginBottom: 4,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: colors.inkSoft,
    marginBottom: 10,
    lineHeight: 16,
  },
  input: {
    fontFamily: fonts.monoRegular,
    fontSize: 13,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    color: colors.ink,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
  },
  btnPrimary: {
    backgroundColor: colors.stamp,
  },
  btnPrimaryText: {
    fontFamily: fonts.bodySemiBold,
    color: colors.stampInk,
    fontSize: 13,
  },
  btnSecondary: {
    borderWidth: 1,
    borderColor: colors.line,
  },
  btnSecondaryText: {
    fontFamily: fonts.bodySemiBold,
    color: colors.ink,
    fontSize: 13,
  },
});
