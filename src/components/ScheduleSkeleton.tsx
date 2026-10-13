import { StyleSheet, View } from "react-native";
import { colors, spacing } from "../theme";
import { cardStyles } from "./ClassCard";
import { Skeleton } from "./Skeleton";

function CardSkeleton() {
  return (
    <View style={cardStyles.card}>
      <View style={styles.time}>
        <Skeleton width={64} height={16} />
        <Skeleton width={40} height={12} />
      </View>
      <View style={styles.divider} />
      <View style={styles.main}>
        <Skeleton width={120} height={18} />
        <Skeleton width={90} height={12} />
        <Skeleton
          width={96}
          height={26}
          radius={13}
          style={{ marginTop: spacing.sm }}
        />
      </View>
    </View>
  );
}

export function ScheduleSkeleton() {
  return (
    <>
      <View style={styles.header}>
        <Skeleton width={160} height={22} />
        <Skeleton width={120} height={12} />
      </View>
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.sm, marginBottom: spacing.xs },
  time: { width: 76, gap: spacing.sm },
  divider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
    backgroundColor: colors.border,
    marginHorizontal: 14,
  },
  main: { flex: 1, gap: spacing.sm },
});
