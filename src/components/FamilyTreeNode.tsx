import { Heart } from 'lucide-react';

type DbMember = {
  id: string;
  name: string;
  role: string;
  image: string;
  dateOfPassing?: string;
};

export type MarriageGroup = {
  id: string;
  spouse1: DbMember;
  spouse2: DbMember;
  children: DbMember[];
};

type FamilyTreeNodeProps = {
  member: DbMember;
  marriages?: MarriageGroup[];
  children?: DbMember[];
  isRoot?: boolean;
};

function FamilyTreeCard({ person }: { person: DbMember }) {
  return (
    <div className="relative z-10 flex w-[150px] min-h-[142px] flex-col items-center justify-center rounded-2xl border-2 border-orange-200 bg-white p-3 shadow-sm">
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
        <span className="mt-1 text-[10px]">🕊️</span>
      )}
    </div>
  );
}

/**
 * Heart connection between two spouses.
 *
 * IMPORTANT:
 * The descendant connector is positioned directly underneath
 * the heart. It does NOT come from either person's card.
 */
function LoveConnection({
  hasChildren,
}: {
  hasChildren: boolean;
}) {
  return (
    <div className="relative flex h-[142px] w-12 flex-shrink-0 items-center justify-center">
      <Heart
        size={20}
        strokeWidth={2}
        className="relative z-20 text-orange-400"
        fill="currentColor"
      />

      {hasChildren && (
        <div
          className="absolute left-1/2 top-[calc(50%+10px)] w-px -translate-x-1/2 bg-gray-300"
          style={{ height: '34px' }}
        />
      )}
    </div>
  );
}

/**
 * Horizontal connector joining multiple children.
 *
 * The vertical stem starts exactly from the heart's connector.
 */
function ChildrenConnector({
  count,
}: {
  count: number;
}) {
  if (count === 0) return null;

  if (count === 1) {
    return (
      <div className="relative h-10 w-full">
        <div className="absolute left-1/2 top-0 h-10 w-px -translate-x-1/2 bg-gray-300" />
      </div>
    );
  }

  return (
    <div className="relative h-10 w-full">
      {/* Main vertical line from the heart */}
      <div className="absolute left-1/2 top-0 h-5 w-px -translate-x-1/2 bg-gray-300" />

      {/* Horizontal child distribution line */}
      <div className="absolute left-1/2 top-5 h-px w-[calc(100%-150px)] -translate-x-1/2 bg-gray-300" />
    </div>
  );
}

/**
 * A single child card with its connector.
 */
function ChildCard({
  child,
  isFirst,
  isLast,
  count,
}: {
  child: DbMember;
  isFirst: boolean;
  isLast: boolean;
  count: number;
}) {
  return (
    <div className="relative flex min-w-[170px] flex-col items-center">
      {count > 1 && (
        <>
          {/* Vertical connector directly into the child */}
          <div className="absolute left-1/2 top-0 h-5 w-px -translate-x-1/2 bg-gray-300" />

          {/* Left half of horizontal distribution line */}
          {!isFirst && (
            <div className="absolute right-1/2 top-0 h-px w-[calc(50%-85px)] bg-gray-300" />
          )}

          {/* Right half of horizontal distribution line */}
          {!isLast && (
            <div className="absolute left-1/2 top-0 h-px w-[calc(50%-85px)] bg-gray-300" />
          )}
        </>
      )}

      <div className="pt-5">
        <FamilyTreeCard person={child} />
      </div>
    </div>
  );
}

/**
 * One complete marriage unit.
 *
 * This is the important structural change:
 *
 * spouse ── ❤️ ── spouse
 *              │
 *        ┌─────┼─────┐
 *        │     │     │
 *      child child child
 *
 * Each marriage gets its OWN contained unit.
 */
function MarriageUnit({
  marriage,
  isFirstMarriage,
}: {
  marriage: MarriageGroup;
  isFirstMarriage: boolean;
}) {
  const hasChildren = marriage.children.length > 0;

  return (
    <div
      className={`relative flex flex-col items-center ${
        !isFirstMarriage ? 'mt-12' : ''
      }`}
    >
      {/* Marriage container */}
      <div className="relative rounded-3xl border border-orange-100 bg-orange-50/30 px-8 py-7 shadow-sm">
        {/* Small label */}
        <div className="absolute left-1/2 top-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-3 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-orange-400 shadow-sm">
          Marriage
        </div>

        {/* Husband / Wife row */}
        <div className="flex items-center justify-center pt-2">
          <FamilyTreeCard person={marriage.spouse1} />

          <LoveConnection hasChildren={hasChildren} />

          <FamilyTreeCard person={marriage.spouse2} />
        </div>

        {/* Children */}
        {hasChildren && (
          <div className="relative mt-0 w-full">
            <ChildrenConnector count={marriage.children.length} />

            <div className="flex justify-center">
              {marriage.children.map((child, index) => (
                <ChildCard
                  key={child.id}
                  child={child}
                  isFirst={index === 0}
                  isLast={index === marriage.children.length - 1}
                  count={marriage.children.length}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Main family-tree node.
 *
 * A person may have:
 *
 *   0 marriages
 *   1 marriage
 *   2 marriages
 *   3+ marriages
 *
 * without breaking the tree structure.
 */
export default function FamilyTreeNode({
  member,
  marriages = [],
  children = [],
  isRoot = false,
}: FamilyTreeNodeProps) {
  /**
   * If this person has no recorded marriage, show them
   * normally and connect their children directly underneath.
   */
  if (marriages.length === 0) {
    return (
      <div
        className={`relative flex flex-col items-center ${
          !isRoot ? 'pt-8' : ''
        }`}
      >
        {!isRoot && (
          <div className="absolute left-1/2 top-0 h-8 w-px -translate-x-1/2 bg-gray-300" />
        )}

        <FamilyTreeCard person={member} />

        {children.length > 0 && (
          <>
            <div className="h-8 w-px bg-gray-300" />

            <div className="flex justify-center">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="relative min-w-[170px] px-2 pt-5"
                >
                  <div className="absolute left-1/2 top-0 h-5 w-px -translate-x-1/2 bg-gray-300" />

                  <FamilyTreeCard person={child} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  /**
   * The person's marriages are displayed as separate,
   * contained marriage units.
   */
  return (
    <div
      className={`flex flex-col items-center ${
        !isRoot ? 'pt-8' : ''
      }`}
    >
      {!isRoot && (
        <div className="h-8 w-px bg-gray-300" />
      )}

      {marriages.map((marriage, index) => (
        <MarriageUnit
          key={marriage.id}
          marriage={marriage}
          isFirstMarriage={index === 0}
        />
      ))}
    </div>
  );
}