import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Server, Wifi, Check, X } from 'lucide-react-native';
import { colors, fonts, radius } from '../theme';
import { useApi } from '../api/client';

export default function ApiSettingsBanner() {
  const { baseUrl, setBaseUrl } = useApi();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(baseUrl);

  if (!editing) {
    return (
      <Pressable
        style={styles.collapsed}
        onPress={() => {
          setDraft(baseUrl);
          setEditing(true);
        }}
      >
        <View style={styles.collapsedInner}>
          <View style={styles.statusDot} />
          <Server size={14} color={colors.gradientMid} strokeWidth={2} />
          <Text style={styles.collapsedText} numberOfLines={1}>
            API: <Text style={styles.mono}>{baseUrl}</Text>
          </Text>
          <Text style={styles.tapText}>Edit</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.expanded}>
      <View style={styles.expandedTitleRow}>
        <Wifi size={16} color={colors.gradientMid} strokeWidth={2.2} />
        <Text style={styles.label}>Backend Server Address</Text>
      </View>
      <Text style={styles.hint}>
        To test on your phone, enter your laptop's Wi-Fi / LAN IP (e.g. http://192.168.1.50:8080/api).
        Phone and laptop must be on the same Wi-Fi network.
      </Text>
      <TextInput
        style={styles.input}
        value={draft}
        onChangeText={setDraft}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="http://192.168.1.20:8080/api"
        placeholderTextColor={colors.inkSoft}
      />
      <View style={styles.row}>
        <Pressable
          style={[styles.btn, styles.btnPrimary]}
          onPress={() => {
            setBaseUrl(draft.trim());
            setEditing(false);
          }}
        >
          <Check size={13} color={colors.stampInk} strokeWidth={2.5} />
          <Text style={styles.btnPrimaryText}>Save Connection</Text>
        </Pressable>
        <Pressable
          style={[styles.btn, styles.btnSecondary]}
          onPress={() => setEditing(false)}
        >
          <X size={13} color={colors.ink} strokeWidth={2} />
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
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  collapsedInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.good,
  },
  collapsedText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: colors.inkSoft,
  },
  mono: {
    fontFamily: fonts.monoRegular,
    color: colors.steelDark,
  },
  tapText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.gradientMid,
  },
  expanded: {
    backgroundColor: colors.panel,
    borderWidth: 1.5,
    borderColor: colors.gradientMid,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  expandedTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12.5,
    color: colors.ink,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkSoft,
    marginBottom: 10,
    lineHeight: 16,
  },
  input: {
    fontFamily: fonts.monoRegular,
    fontSize: 12.5,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingVertical: 9,
    paddingHorizontal: 11,
    marginBottom: 12,
    color: colors.ink,
    backgroundColor: colors.paper,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
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
    fontSize: 12.5,
  },
  btnSecondary: {
    borderWidth: 1,
    borderColor: colors.line,
  },
  btnSecondaryText: {
    fontFamily: fonts.bodySemiBold,
    color: colors.ink,
    fontSize: 12.5,
  },
});
