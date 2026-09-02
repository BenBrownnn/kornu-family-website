
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';

type Member = {
  id: string;
  name: string;
  role: string | null;
  image: string | null;
  generation: number | null;
  marriage_id: string | null;
};

type Relationship = {
  id: string;
  parent_id: string;
  child_id: string;
  relationship_type: string | null;
};

type Marriage = {
  id: string;
  spouse_1_id: string;
  spouse_2_id: string;
  status: string | null;
};

type FamilyGroup = {
  id: string;
  type: 'couple' | 'single';
  familyMember: Member;
  spouse?: Member;
  marriage?: Marriage;
};

export default function TreeScreen() {
  const [members, setMembers] = useState<Member[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [marriages, setMarriages] = useState<Marriage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTree();
  }, []);

  async function loadTree() {
    try {
      setLoading(true);
      setError('');

      const [membersResult, relationshipsResult, marriagesResult] =
        await Promise.all([
          supabase
            .from('members')
            .select(
              'id,name,role,image,generation,marriage_id'
            )
            .order('generation', {
              ascending: true,
            }),

          supabase
            .from('parent_child_relationships')
            .select(
              'id,parent_id,child_id,relationship_type'
            ),

          supabase
            .from('marriages')
            .select(
              'id,spouse_1_id,spouse_2_id,status'
            ),
        ]);

      if (membersResult.error) {
        throw membersResult.error;
      }

      if (relationshipsResult.error) {
        throw relationshipsResult.error;
      }

      if (marriagesResult.error) {
        throw marriagesResult.error;
      }

      setMembers(membersResult.data ?? []);
      setRelationships(
        relationshipsResult.data ?? []
      );
      setMarriages(
        marriagesResult.data ?? []
      );
    } catch (err) {
      console.error(
        'Tree loading error:',
        err
      );

      setError(
        'Unable to load the family tree.'
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * MEMBER LOOKUP
   * ---------------------------------------------------------
   */

  const memberMap = useMemo(() => {
    const map = new Map<string, Member>();

    members.forEach((member) => {
      map.set(member.id, member);
    });

    return map;
  }, [members]);

  /*
   * ---------------------------------------------------------
   * GENERATIONS
   * ---------------------------------------------------------
   */

  const generations = useMemo(() => {
    return Array.from(
      new Set(
        members
          .map(
            (member) => member.generation
          )
          .filter(
            (
              generation
            ): generation is number =>
              generation !== null
          )
      )
    ).sort((a, b) => a - b);
  }, [members]);

  /*
   * ---------------------------------------------------------
   * FAMILY MEMBER DETECTION
   *
   * We prefer Son / Daughter as the actual family member.
   * This means:
   *
   * John Lily Kornu  💍  Charlotte
   *       LEFT              RIGHT
   *
   * rather than:
   *
   * Charlotte  💍  John Lily Kornu
   * ---------------------------------------------------------
   */

  function isActualFamilyMember(
    member: Member
  ) {
    const role =
      member.role?.toLowerCase() ?? '';

    return (
      role.includes('son') ||
      role.includes('daughter') ||
      role.includes('father') ||
      role.includes('mother') ||
      role.includes('child')
    );
  }

  function orderCouple(
    first: Member,
    second: Member
  ) {
    const firstIsFamily =
      isActualFamilyMember(first);

    const secondIsFamily =
      isActualFamilyMember(second);

    if (
      !firstIsFamily &&
      secondIsFamily
    ) {
      return {
        familyMember: second,
        spouse: first,
      };
    }

    return {
      familyMember: first,
      spouse: second,
    };
  }

  /*
   * ---------------------------------------------------------
   * ACTIVE MARRIAGES
   * ---------------------------------------------------------
   *
   * Divorced marriages are ignored.
   * Every other marriage is displayed.
   *
   * This is important because one person can have
   * more than one marriage.
   */

  const activeMarriages = useMemo(() => {
    return marriages.filter(
      (marriage) =>
        marriage.status?.toLowerCase() !==
        'divorced'
    );
  }, [marriages]);

  /*
   * ---------------------------------------------------------
   * GET CHILDREN
   * ---------------------------------------------------------
   */

  function getChildren(
    memberId: string
  ) {
    return relationships
      .filter(
        (relationship) =>
          relationship.parent_id ===
          memberId
      )
      .map((relationship) =>
        memberMap.get(
          relationship.child_id
        )
      )
      .filter(
        (
          member
        ): member is Member =>
          Boolean(member)
      );
  }

  /*
   * Get all children belonging to either
   * member of a couple.
   */
  function getCoupleChildren(
    first: Member,
    second?: Member
  ) {
    const children = [
      ...getChildren(first.id),
      ...(second
        ? getChildren(second.id)
        : []),
    ];

    const unique = new Map<
      string,
      Member
    >();

    children.forEach((child) => {
      unique.set(child.id, child);
    });

    return Array.from(unique.values()).sort(
      (a, b) =>
        (a.generation ?? 0) -
        (b.generation ?? 0)
    );
  }

  /*
   * ---------------------------------------------------------
   * MEMBER CARD
   * ---------------------------------------------------------
   */

  function MemberCard({
    member,
    compact = false,
  }: {
    member: Member;
    compact?: boolean;
  }) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={[
          styles.memberCard,
          compact &&
            styles.compactCard,
        ]}
      >
        {member.image ? (
          <Image
            source={{
              uri: member.image,
            }}
            style={[
              styles.memberImage,
              compact &&
                styles.compactImage,
            ]}
          />
        ) : (
          <View
            style={[
              styles.memberImagePlaceholder,
              compact &&
                styles.compactImage,
            ]}
          >
            <Text
              style={[
                styles.initial,
                compact &&
                  styles.compactInitial,
              ]}
            >
              {member.name
                .charAt(0)
                .toUpperCase()}
            </Text>
          </View>
        )}

        <Text
          style={[
            styles.memberName,
            compact &&
              styles.compactName,
          ]}
          numberOfLines={2}
        >
          {member.name}
        </Text>

        {member.role ? (
          <Text
            style={[
              styles.memberRole,
              compact &&
                styles.compactRole,
            ]}
            numberOfLines={1}
          >
            {member.role}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  }

  /*
   * ---------------------------------------------------------
   * COUPLE
   * ---------------------------------------------------------
   *
   * The actual family member ALWAYS appears first.
   */

  function Couple({
    familyMember,
    spouse,
  }: {
    familyMember: Member;
    spouse: Member;
  }) {
    return (
      <View style={styles.couple}>
        <MemberCard
          member={familyMember}
        />

        <View
          style={styles.marriageConnection}
        >
          <View
            style={styles.marriageLine}
          />

          <Text style={styles.ring}>
            💍
          </Text>

          <View
            style={styles.marriageLine}
          />
        </View>

        <MemberCard member={spouse} />
      </View>
    );
  }

  /*
   * ---------------------------------------------------------
   * BUILD FAMILY GROUPS FOR A GENERATION
   * ---------------------------------------------------------
   *
   * Important:
   * A person with multiple marriages gets multiple
   * family groups.
   */

  function buildFamilyGroups(
    generation: number
  ): FamilyGroup[] {
    const generationMembers =
      members.filter(
        (member) =>
          member.generation ===
          generation
      );

    const groups: FamilyGroup[] = [];

    const membersInMarriage =
      new Set<string>();

    /*
     * First create all marriage groups.
     */
    activeMarriages.forEach(
      (marriage) => {
        const spouse1 =
          memberMap.get(
            marriage.spouse_1_id
          );

        const spouse2 =
          memberMap.get(
            marriage.spouse_2_id
          );

        if (
          !spouse1 ||
          !spouse2
        ) {
          return;
        }

        /*
         * Only display the couple together
         * when both members belong to the
         * same generation.
         */
        if (
          spouse1.generation !==
            generation &&
          spouse2.generation !==
            generation
        ) {
          return;
        }

        /*
         * If the marriage connects two different
         * generations, display the member belonging
         * to this generation separately.
         */
        if (
          spouse1.generation !==
            spouse2.generation
        ) {
          const member =
            spouse1.generation ===
            generation
              ? spouse1
              : spouse2;

          groups.push({
            id: `${marriage.id}-${member.id}`,
            type: 'single',
            familyMember: member,
            marriage,
          });

          membersInMarriage.add(
            member.id
          );

          return;
        }

        const ordered =
          orderCouple(
            spouse1,
            spouse2
          );

        groups.push({
          id: marriage.id,
          type: 'couple',
          familyMember:
            ordered.familyMember,
          spouse: ordered.spouse,
          marriage,
        });

        membersInMarriage.add(
          spouse1.id
        );

        membersInMarriage.add(
          spouse2.id
        );
      }
    );

    /*
     * Now add people who have no marriage
     * in this generation.
     */
    generationMembers.forEach(
      (member) => {
        if (
          membersInMarriage.has(
            member.id
          )
        ) {
          return;
        }

        /*
         * If this person has a marriage with
         * someone from another generation,
         * don't duplicate them here if they
         * were already represented.
         */
        const alreadyDisplayed =
          groups.some(
            (group) =>
              group.familyMember.id ===
                member.id ||
              group.spouse?.id ===
                member.id
          );

        if (alreadyDisplayed) {
          return;
        }

        groups.push({
          id: `single-${member.id}`,
          type: 'single',
          familyMember: member,
        });
      }
    );

    return groups;
  }

  /*
   * ---------------------------------------------------------
   * CHILDREN DISPLAY
   * ---------------------------------------------------------
   */

  function ChildrenBranch({
    children,
  }: {
    children: Member[];
  }) {
    if (children.length === 0) {
      return null;
    }

    return (
      <View style={styles.childrenArea}>
        {/* Main vertical connection from parents */}
        <View
          style={styles.mainVerticalLine}
        />

        {/* Horizontal sibling connection */}
        {children.length > 1 ? (
          <View
            style={[
              styles.childrenHorizontalLine,
              {
                width: Math.max(
                  children.length *
                    145,
                  145
                ),
              },
            ]}
          />
        ) : null}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.childrenScroll
          }
        >
          <View
            style={
              styles.childrenRow
            }
          >
            {children.map(
              (child) => (
                <View
                  key={child.id}
                  style={
                    styles.childColumn
                  }
                >
                  <View
                    style={
                      styles.childVerticalLine
                    }
                  />

                  <MemberCard
                    member={child}
                    compact
                  />
                </View>
              )
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  /*
   * ---------------------------------------------------------
   * FAMILY GROUP
   * ---------------------------------------------------------
   */

  function FamilyGroupView({
    group,
  }: {
    group: FamilyGroup;
  }) {
    const children =
      getCoupleChildren(
        group.familyMember,
        group.spouse
      );

    return (
      <View
        style={styles.familyGroup}
      >
        {group.type === 'couple' &&
        group.spouse ? (
          <Couple
            familyMember={
              group.familyMember
            }
            spouse={group.spouse}
          />
        ) : (
          <MemberCard
            member={
              group.familyMember
            }
          />
        )}

        <ChildrenBranch
          children={children}
        />
      </View>
    );
  }

  /*
   * ---------------------------------------------------------
   * GENERATION
   * ---------------------------------------------------------
   */

  function GenerationSection({
    generation,
  }: {
    generation: number;
  }) {
    const groups =
      buildFamilyGroups(
        generation
      );

    return (
      <View
        style={
          styles.generationSection
        }
      >
        <View
          style={
            styles.generationTitleRow
          }
        >
          <View
            style={styles.titleLine}
          />

          <Text
            style={
              styles.generationTitle
            }
          >
            Generation {generation}
          </Text>

          <View
            style={styles.titleLine}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.generationContent
          }
        >
          {groups.map(
            (group) => (
              <FamilyGroupView
                key={group.id}
                group={group}
              />
            )
          )}
        </ScrollView>
      </View>
    );
  }

  /*
   * ---------------------------------------------------------
   * LOADING
   * ---------------------------------------------------------
   */

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#0077B6"
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Building family tree...
        </Text>
      </View>
    );
  }

  /*
   * ---------------------------------------------------------
   * ERROR
   * ---------------------------------------------------------
   */

  if (error) {
    return (
      <View style={styles.center}>
        <Text
          style={styles.error}
        >
          {error}
        </Text>

        <TouchableOpacity
          style={
            styles.retryButton
          }
          onPress={loadTree}
        >
          <Text
            style={
              styles.retryText
            }
          >
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  /*
   * ---------------------------------------------------------
   * EMPTY
   * ---------------------------------------------------------
   */

  if (members.length === 0) {
    return (
      <View style={styles.center}>
        <Text
          style={
            styles.emptyTitle
          }
        >
          No family members yet
        </Text>

        <Text
          style={styles.emptyText}
        >
          Add family members through
          the family portal to build
          the tree.
        </Text>
      </View>
    );
  }

  /*
   * ---------------------------------------------------------
   * MAIN SCREEN
   * ---------------------------------------------------------
   */

  return (
    <View
      style={styles.container}
    >
      <View
        style={styles.header}
      >
        <Text
          style={styles.title}
        >
          Family Tree
        </Text>

        <Text
          style={styles.subtitle}
        >
          {members.length}{' '}
          family member
          {members.length === 1
            ? ''
            : 's'}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.treeContent
        }
      >
        <View
          style={styles.treeIntro}
        >
          <Text
            style={styles.treeIcon}
          >
            🌳
          </Text>

          <Text
            style={
              styles.treeDescription
            }
          >
            Explore the Kornu family
            across generations
          </Text>
        </View>

        {generations.map(
          (generation) => (
            <GenerationSection
              key={generation}
              generation={
                generation
              }
            />
          )
        )}
      </ScrollView>
    </View>
  );
}

/*
 * =========================================================
 * STYLES
 * =========================================================
 */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },

  header: {
    paddingTop: 58,
    paddingHorizontal: 20,
    paddingBottom: 18,
    backgroundColor: '#FFFFFF',
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
  },

  subtitle: {
    marginTop: 5,
    fontSize: 15,
    color: '#6B7280',
  },

  treeContent: {
    paddingTop: 20,
    paddingBottom: 100,
  },

  treeIntro: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 25,
  },

  treeIcon: {
    fontSize: 42,
  },

  treeDescription: {
    marginTop: 8,
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
  },

  generationSection: {
    marginBottom: 42,
  },

  generationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },

  titleLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D8E3EA',
  },

  generationTitle: {
    marginHorizontal: 12,
    fontSize: 15,
    fontWeight: '800',
    color: '#0077B6',
  },

  generationContent: {
    paddingHorizontal: 25,
    alignItems: 'flex-start',
  },

  familyGroup: {
    alignItems: 'center',
    marginRight: 45,
    minWidth: 310,
  },

  couple: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  memberCard: {
    width: 145,
    minHeight: 155,
    padding: 12,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',

    elevation: 3,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  compactCard: {
    width: 125,
    minHeight: 135,
    padding: 10,
    borderRadius: 16,
  },

  memberImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E5E7EB',
    marginBottom: 8,
  },

  compactImage: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },

  memberImagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E6F4FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  initial: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0077B6',
  },

  compactInitial: {
    fontSize: 22,
  },

  memberName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },

  compactName: {
    fontSize: 12,
  },

  memberRole: {
    marginTop: 4,
    fontSize: 11,
    color: '#0077B6',
    textAlign: 'center',
  },

  compactRole: {
    fontSize: 10,
  },

  /*
   * Marriage connection
   */

  marriageConnection: {
    width: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  marriageLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#D4A72C',
  },

  ring: {
    marginHorizontal: 2,
    fontSize: 16,
  },

  /*
   * Children
   */

  childrenArea: {
    width: '100%',
    alignItems: 'center',
    marginTop: 2,
  },

  mainVerticalLine: {
    width: 2,
    height: 30,
    backgroundColor: '#9DB7C5',
  },

  childrenHorizontalLine: {
    height: 2,
    backgroundColor: '#9DB7C5',
    marginBottom: 0,
  },

  childrenScroll: {
    alignItems: 'flex-start',
    paddingHorizontal: 8,
  },

  childrenRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  childColumn: {
    alignItems: 'center',
    marginHorizontal: 8,
  },

  childVerticalLine: {
    width: 2,
    height: 18,
    backgroundColor: '#9DB7C5',
  },

  /*
   * Loading / empty / errors
   */

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F9FC',
    padding: 25,
  },

  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
  },

  error: {
    color: '#B91C1C',
    fontSize: 16,
    textAlign: 'center',
  },

  retryButton: {
    marginTop: 18,
    backgroundColor: '#0077B6',
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 10,
  },

  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },

  emptyText: {
    marginTop: 8,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 21,
  },
});
