import { Heart } from 'lucide-react';

export type DbMember = {
  id: string;
  name: string;
  role: string;
  image: string;
  dateOfPassing?: string | null;
};

/**
 * A marriage is the actual relationship node in the tree.
 *
 * One person can therefore appear in multiple MarriageGroups.
 *
 * Example:
 *
 * Ama
 * ├── Husband 1 ❤️ → Children A/B
 * └── Husband 2 ❤️ → Children C/D
 */
export type MarriageGroup = {
  id: string;
  spouse1: DbMember;
  spouse2: DbMember;
  children: TreeNode[];
};

/**
 * A TreeNode represents one family member.
 *
 * That member can have:
 * - no marriages
 * - one marriage
 * - multiple marriages
 *
 * Each marriage has its own children.
 */
export type TreeNode = {
  member: DbMember;
  marriages: MarriageGroup[];
};

type FamilyTreeNodeProps = {
  node: TreeNode;
  isRoot?: boolean;
};

/* =========================================================
   PERSON CARD
   ========================================================= */

function FamilyTreeCard({
  person,
}: {
  person: DbMember;
}) {
  return (
    <div className="relative z-20 flex min-h-[142px] w-[150px] flex-col items-center justify-center rounded-2xl border-2 border-orange-200 bg-white p-3 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <img
        src={person.image || '/images/placeholder.jpg'}
        alt={person.name}
        className={`mb-2 h-14 w-14 rounded-full object-cover ${
          person.dateOfPassing ? 'grayscale-[40%]' : ''
        }`}
        onError={(e) => {
          e.currentTarget.src = '/images/placeholder.jpg';
        }}
      />

      <p className="max-w-[125px] text-center text-xs font-bold leading-tight text-gray-900">
        {person.name}
      </p>

      <p className="mt-1 max-w-[125px] text-center text-[10px] text-gray-400">
        {person.role}
      </p>

      {person.dateOfPassing && (
        <span
          className="mt-1 text-[11px]"
          title="Passed away"
        >
          🕊️
        </span>
      )}
    </div>
  );
}

/* =========================================================
   LOVE / MARRIAGE CONNECTION
   ========================================================= */

/**
 * The heart is the central relationship point.
 *
 * Husband ───── ❤️ ───── Wife
 *                 │
 *                 │
 *              children
 *
 * IMPORTANT:
 * The descendant line originates from the heart,
 * never from either spouse card.
 */
function LoveConnection({
  hasChildren,
}: {
  hasChildren: boolean;
}) {
  return (
    <div className="relative flex h-[142px] w-[52px] flex-shrink-0 items-center justify-center">
      <Heart
        size={22}
        strokeWidth={2}
        className="relative z-30 text-orange-400"
        fill="currentColor"
      />

      {hasChildren && (
        <div
          className="absolute left-1/2 z-10 w-[2px] -translate-x-1/2 bg-gray-300"
          style={{
            top: 'calc(50% + 11px)',
            height: '32px',
          }}
        />
      )}
    </div>
  );
}

/* =========================================================
   CHILDREN CONNECTOR
   ========================================================= */

/**
 * Connector from the marriage heart to the children.
 *
 * One child:
 *
 *       ❤️
 *       │
 *       │
 *     Child
 *
 * Multiple:
 *
 *          ❤️
 *          │
 *      ────┼────
 *       │  │  │
 *       │  │  │
 *      C1 C2 C3
 */
function ChildrenConnector({
  count,
}: {
  count: number;
}) {
  if (count === 0) {
    return null;
  }

  if (count === 1) {
    return (
      <div className="relative h-10 w-full">
        <div className="absolute left-1/2 top-0 h-10 w-[2px] -translate-x-1/2 bg-gray-300" />
      </div>
    );
  }

  return (
    <div className="relative h-10 w-full">
      {/* Vertical line directly from heart */}
      <div className="absolute left-1/2 top-0 h-5 w-[2px] -translate-x-1/2 bg-gray-300" />

      {/* Horizontal distribution line */}
      <div className="absolute left-1/2 top-5 h-[2px] w-[calc(100%-170px)] -translate-x-1/2 bg-gray-300" />
    </div>
  );
}

/* =========================================================
   CHILD NODE
   ========================================================= */

function ChildNode({
  child,
  index,
  total,
}: {
  child: TreeNode;
  index: number;
  total: number;
}) {
  const isFirst = index === 0;
  const isLast = index === total - 1;

  return (
    <div className="relative flex min-w-[180px] flex-col items-center">
      {total > 1 && (
        <>
          {/* Vertical line into this child */}
          <div className="absolute left-1/2 top-0 z-10 h-5 w-[2px] -translate-x-1/2 bg-gray-300" />

          {/* Left horizontal connection */}
          {!isFirst && (
            <div className="absolute right-1/2 top-0 z-10 h-[2px] w-[calc(50%-90px)] bg-gray-300" />
          )}

          {/* Right horizontal connection */}
          {!isLast && (
            <div className="absolute left-1/2 top-0 z-10 h-[2px] w-[calc(50%-90px)] bg-gray-300" />
          )}
        </>
      )}

      <div className="pt-5">
        <FamilyTreeNode
          node={child}
          isRoot={true}
        />
      </div>
    </div>
  );
}

/* =========================================================
   CHILDREN AREA
   ========================================================= */

function ChildrenArea({
  children,
}: {
  children: TreeNode[];
}) {
  if (children.length === 0) {
    return null;
  }

  return (
    <div className="relative mt-0 w-full">
      <ChildrenConnector count={children.length} />

      <div className="flex justify-center">
        {children.map((child, index) => (
          <ChildNode
            key={child.member.id}
            child={child}
            index={index}
            total={children.length}
          />
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   MARRIAGE UNIT
   ========================================================= */

/**
 * One complete marriage relationship.
 *
 * ┌──────────────────────────────────────────┐
 * │                MARRIAGE                  │
 * │                                          │
 * │ Husband ───── ❤️ ───── Wife              │
 * │                │                         │
 * │                │                         │
 * │          ┌─────┼─────┐                   │
 * │          │     │     │                   │
 * │         C1    C2    C3                   │
 * └──────────────────────────────────────────┘
 *
 * Every marriage gets its own container.
 */
function MarriageUnit({
  marriage,
  index,
}: {
  marriage: MarriageGroup;
  index: number;
}) {
  const hasChildren = marriage.children.length > 0;

  return (
    <div
      className={`relative flex flex-col items-center ${
        index > 0 ? 'mt-10' : ''
      }`}
    >
      <div className="relative rounded-3xl border border-orange-100 bg-orange-50/30 px-8 pb-7 pt-6 shadow-sm">
        {/* Marriage label */}
        <div className="absolute left-1/2 top-2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-orange-100 bg-white px-3 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-orange-400 shadow-sm">
          Marriage
        </div>

        {/* Spouses */}
        <div className="flex items-center justify-center pt-2">
          <FamilyTreeCard person={marriage.spouse1} />

          <LoveConnection hasChildren={hasChildren} />

          <FamilyTreeCard person={marriage.spouse2} />
        </div>

        {/* Children belonging ONLY to this marriage */}
        <ChildrenArea
          children={marriage.children}
        />
      </div>
    </div>
  );
}

/* =========================================================
   SINGLE PERSON WITHOUT MARRIAGE
   ========================================================= */

function UnmarriedNode({
  node,
  isRoot,
}: {
  node: TreeNode;
  isRoot: boolean;
}) {
  /**
   * This situation occurs when a family member has children
   * recorded but no marriage record.
   *
   * We still display the children, but the connector comes
   * from the person because there is no marriage heart.
   */
  const children = node.marriages.flatMap(
    (marriage) => marriage.children
  );

  return (
    <div
      className={`relative flex flex-col items-center ${
        !isRoot ? 'pt-8' : ''
      }`}
    >
      {!isRoot && (
        <div className="absolute left-1/2 top-0 h-8 w-[2px] -translate-x-1/2 bg-gray-300" />
      )}

      <FamilyTreeCard person={node.member} />

      {children.length > 0 && (
        <>
          <div className="h-8 w-[2px] bg-gray-300" />

          <div className="flex justify-center">
            {children.map((child, index) => (
              <ChildNode
                key={child.member.id}
                child={child}
                index={index}
                total={children.length}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* =========================================================
   MAIN FAMILY TREE NODE
   ========================================================= */

export default function FamilyTreeNode({
  node,
  isRoot = false,
}: FamilyTreeNodeProps) {
  const marriages = node.marriages || [];

  /**
   * No marriages:
   * display the person normally.
   */
  if (marriages.length === 0) {
    return (
      <UnmarriedNode
        node={node}
        isRoot={isRoot}
      />
    );
  }

  /**
   * Person with one or more marriages.
   *
   * Every marriage is rendered separately.
   *
   * This is what allows:
   *
   * Ama ❤️ Husband 1 → Children 1/2
   *
   * Ama ❤️ Husband 2 → Children 3/4
   *
   * Ama ❤️ Husband 3 → Children 5/6
   */
  return (
    <div
      className={`flex flex-col items-center ${
        !isRoot ? 'pt-8' : ''
      }`}
    >
      {!isRoot && (
        <div className="h-8 w-[2px] bg-gray-300" />
      )}

      {marriages.map((marriage, index) => (
        <MarriageUnit
          key={marriage.id}
          marriage={marriage}
          index={index}
        />
      ))}
    </div>
  );
}