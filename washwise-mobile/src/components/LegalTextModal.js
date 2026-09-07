import { Modal, View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';

export default function LegalTextModal({ title, paragraphs, onClose }) {
  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={onClose}>
            <Text style={styles.close}>Close</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {paragraphs.map((p, i) => (
            <Text key={i} style={styles.paragraph}>{p}</Text>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.ink,
  },
  close: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.gradientMid,
  },
  paragraph: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.inkSoft,
    lineHeight: 21,
    marginBottom: 14,
  },
});
