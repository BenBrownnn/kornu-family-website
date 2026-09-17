import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  LocateFixed,
} from 'lucide-react';

export type DbMember = {
  id: string;
  name: string;
  role: string;
  image: string;
  dateOfPassing?: string | null;
  age?: number | null;
  bio?: string;
  birthDate?: string | null;
  location?: string | null;
  occupation?: string | null;
  generation?: number;
};

export type TreeNode = {
  member: DbMember;
  marriages: MarriageGroup[];
};

export type MarriageGroup = {
  id: string;
  spouse1: DbMember;
  spouse2: DbMember;
  children: TreeNode[];
};

interface FamilyTreeNodeProps {
  node: TreeNode;
  isRoot?: boolean;
  searchTerm?: string;
  focusedMemberId?: string | null;
  onFocusMember?: (memberId: string) => void;
}

interface PersonCardProps {
  member: DbMember;
  searchTerm?: string;
  focusedMemberId?: string | null;
  onFocusMember?: (memberId: string) => void;
}

/* ============================================================
   KORNU FAMILY PALETTE
============================================================ */

const BLUE = '#51A2FF';
const DEEP_BLUE = '#023570';
const MUTED_TEXT = '#52667A';

/* -------------------------------------------------------------------------- */
/* PERSON CARD                                                                */
/* -------------------------------------------------------------------------- */

const PersonCard = ({
  member,
  searchTerm = '',
  focusedMemberId = null,
  onFocusMember,
}: PersonCardProps) => {
  const [imageFailed, setImageFailed] = useState(false);
  const personRef = useRef<HTMLDivElement>(null);

  if (!member) return null;

  const isDeceased = Boolean(member.dateOfPassing);
  const isFocused = focusedMemberId === member.id;

  const initials = member.name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();

  const handleFocus = () => {
    onFocusMember?.(member.id);
  };

  const normalizedName =
    member.name?.toLowerCase() ?? '';

  const normalizedSearch =
    searchTerm.trim().toLowerCase();

  const isMatch =
    normalizedSearch.length > 0 &&
    normalizedName.includes(normalizedSearch);

  const isHighlighted =
    isFocused || isMatch;

  useEffect(() => {
    if (isFocused && personRef.current) {
      personRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
  }, [isFocused]);

  return (
    <div
      ref={personRef}
      id={`family-member-${member.id}`}
      onClick={handleFocus}
      className={`
        group relative flex w-[125px]
        flex-col items-center text-center
        transition-all duration-300 ease-out
        ${isFocused
          ? 'scale-105'
          : 'hover:-translate-y-1'
        }
      `}
    >

      {/* ========================================================
          FOCUS BUTTON
      ========================================================= */}
      {onFocusMember && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleFocus();
          }}
          title={`Focus on ${member.name}`}
          className={`
            absolute right-1 top-0 z-20
            flex h-7 w-7 items-center justify-center
            rounded-full border
            bg-white shadow-sm
            opacity-0 transition-all duration-200
            group-hover:opacity-100
            focus:opacity-100
          `}
          style={{
            borderColor: isFocused
              ? BLUE
              : '#D9E4F0',
            color: isFocused
              ? DEEP_BLUE
              : MUTED_TEXT,
          }}
        >
          <LocateFixed size={13} />
        </button>
      )}

      {/* ========================================================
          PHOTO
      ========================================================= */}
      <div
        className={`
          relative h-[82px] w-[82px]
          overflow-hidden rounded-full
          bg-white shadow-md
          transition-all duration-300
          ${
            isDeceased
              ? 'grayscale border-[3px] border-slate-300'
              : 'border-[3px] border-white'
          }
          ${
            isMatch
              ? 'ring-4 ring-[#51A2FF]/25 scale-105'
              : ''
          }
          ${
            isFocused
              ? 'ring-4 ring-[#51A2FF]/35 shadow-lg'
              : 'ring-2 ring-[#D0E6FF]/80'
          }
        `}
        style={{
          borderColor:
            isFocused || isMatch
              ? BLUE
              : undefined,
        }}
      >

        {!imageFailed && member.image ? (
          <img
            src={member.image}
            alt={member.name}
            className="h-full w-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div
            className={`
              flex h-full w-full
              items-center justify-center
              text-lg font-bold
              ${
                isDeceased
                  ? 'bg-slate-100 text-slate-400'
                  : 'bg-gradient-to-br from-[#D0E6FF] to-[#E9D5FF] text-[#023570]'
              }
            `}
          >
            {initials || '?'}
          </div>
        )}

        {/* Focus glow */}
        {isFocused && (
          <div className="absolute inset-0 rounded-full ring-2 ring-inset ring-white/60 pointer-events-none" />
        )}

      </div>

      {/* ========================================================
          NAME
      ========================================================= */}
      <p
        className={`
          mt-2 line-clamp-2
          max-w-[125px]
          text-xs font-bold leading-tight
          transition-colors duration-200
          ${
            isHighlighted
              ? 'text-[#023570]'
              : 'text-[#102A43]'
          }
        `}
      >
        {member.name}
      </p>

      {/* ========================================================
          ROLE
      ========================================================= */}
      {member.role && (
        <p
          className={`
            mt-1 line-clamp-1
            max-w-[125px]
            text-[10px]
            ${
              isHighlighted
                ? 'text-[#6A1B9A]'
                : 'text-[#52667A]'
            }
          `}
        >
          {member.role}
        </p>
      )}

      {/* ========================================================
          DECEASED LABEL
      ========================================================= */}
      {isDeceased && (
        <p className="mt-1 flex items-center gap-1 text-[9px] italic text-slate-400">
          <span aria-hidden="true">
            🕊️
          </span>

          <span>
            In loving memory
          </span>
        </p>
      )}

    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* MARRIAGE CONNECTION                                                        */
/* -------------------------------------------------------------------------- */

const MarriageConnection = () => (
  <div className="flex items-center justify-center">

    {/* Left connector */}
    <div className="h-px w-7 bg-[#AFC4D8] sm:w-10" />

    {/* Marriage ring */}
    <div
      className="
        mx-1 flex h-9 w-9 shrink-0
        items-center justify-center
        rounded-full
        border-2 border-[#51A2FF]
        bg-gradient-to-br
        from-[#F8FBFF]
        to-[#E9D5FF]/50
        text-[15px]
        shadow-sm
        transition-all duration-200
        hover:scale-105
        hover:shadow-md
      "
      title="Marriage"
    >
      💍
    </div>

    {/* Right connector */}
    <div className="h-px w-7 bg-[#AFC4D8] sm:w-10" />

  </div>
);

/* -------------------------------------------------------------------------- */
/* COLLAPSE BUTTON                                                            */
/* -------------------------------------------------------------------------- */

const CollapseButton = ({
  collapsed,
  onClick,
  count,
}: {
  collapsed: boolean;
  onClick: () => void;
  count: number;
}) => {
  if (count === 0) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      title={
        collapsed
          ? 'Expand descendants'
          : 'Collapse descendants'
      }
      className="
        relative z-20 mt-2
        flex items-center gap-1.5
        rounded-full
        border border-[#D9E4F0]
        bg-white
        px-3 py-1.5
        text-[10px] font-semibold
        text-[#52667A]
        shadow-sm
        transition-all duration-200
        hover:border-[#51A2FF]
        hover:bg-[#F5F9FF]
        hover:text-[#023570]
        hover:shadow-md
      "
    >

      <span
        className="
          flex h-4 w-4
          items-center justify-center
          rounded-full
          bg-[#D0E6FF]
        "
      >
        {collapsed ? (
          <ChevronRight
            size={11}
            className="text-[#023570]"
          />
        ) : (
          <ChevronDown
            size={11}
            className="text-[#023570]"
          />
        )}
      </span>

      {count}{' '}
      {count === 1
        ? 'member'
        : 'members'}

    </button>
  );
};

/* -------------------------------------------------------------------------- */
/* CHILDREN                                                                   */
/* -------------------------------------------------------------------------- */

const ChildrenRow = ({
  items,
  searchTerm,
  focusedMemberId,
  onFocusMember,
}: {
  items: TreeNode[];
  searchTerm?: string;
  focusedMemberId?: string | null;
  onFocusMember?: (memberId: string) => void;
}) => {
  const validChildren = Array.from(
    new Map(
      (items || [])
        .filter(
          (child) =>
            child &&
            child.member
        )
        .map((child) => [
          child.member.id,
          child,
        ])
    ).values()
  );

  if (validChildren.length === 0) {
    return null;
  }

  /* ============================================================
     SINGLE CHILD
  ============================================================ */
  if (validChildren.length === 1) {
    return (
      <div className="flex flex-col items-center">

        {/* Parent → child connector */}
        <div className="h-8 w-px bg-[#AFC4D8]" />

        <FamilyTreeNode
          node={validChildren[0]}
          searchTerm={searchTerm}
          focusedMemberId={focusedMemberId}
          onFocusMember={onFocusMember}
        />

      </div>
    );
  }

  /* ============================================================
     MULTIPLE CHILDREN
  ============================================================ */
  return (
    <div className="flex flex-col items-center">

      {/* Parent → generation connector */}
      <div className="h-8 w-px bg-[#AFC4D8]" />

      <div className="relative">

        {/* Horizontal generation connector */}
        <div
          className="
            absolute left-1/2 top-0
            h-px -translate-x-1/2
            bg-[#AFC4D8]
          "
          style={{
            width:
              'calc(100% - 125px)',
          }}
        />

        <div className="flex items-start justify-center gap-5 sm:gap-8">

          {validChildren.map(
            (child) => (
              <div
                key={child.member.id}
                className="
                  relative flex
                  flex-col items-center
                "
              >

                {/* Branch down to child */}
                <div className="h-6 w-px bg-[#AFC4D8]" />

                <FamilyTreeNode
                  node={child}
                  searchTerm={searchTerm}
                  focusedMemberId={
                    focusedMemberId
                  }
                  onFocusMember={
                    onFocusMember
                  }
                />

              </div>
            )
          )}

        </div>

      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* SINGLE MARRIAGE                                                            */
/* -------------------------------------------------------------------------- */

const SingleMarriage = ({
  node,
  marriage,
  searchTerm,
  focusedMemberId,
  onFocusMember,
}: {
  node: TreeNode;
  marriage: MarriageGroup;
  searchTerm?: string;
  focusedMemberId?: string | null;
  onFocusMember?: (memberId: string) => void;
}) => {
  const [collapsed, setCollapsed] =
    useState(false);

  const spouse =
    marriage.spouse1.id === node.member.id
      ? marriage.spouse2
      : marriage.spouse1;

  const children = Array.from(
    new Map(
      (marriage.children || [])
        .filter(
          (child) =>
            child &&
            child.member
        )
        .map((child) => [
          child.member.id,
          child,
        ])
    ).values()
  );

  return (
    <div className="flex flex-col items-center">

      {/* ========================================================
          COUPLE
      ========================================================= */}
      <div className="flex items-center justify-center">

        <PersonCard
          member={node.member}
          searchTerm={searchTerm}
          focusedMemberId={focusedMemberId}
          onFocusMember={onFocusMember}
        />

        <MarriageConnection />

        <PersonCard
          member={spouse}
          searchTerm={searchTerm}
          focusedMemberId={focusedMemberId}
          onFocusMember={onFocusMember}
        />

      </div>

      {/* ========================================================
          CHILDREN TOGGLE
      ========================================================= */}
      {children.length > 0 && (
        <>
          <div className="h-4 w-px bg-[#AFC4D8]" />

          <CollapseButton
            collapsed={collapsed}
            onClick={() =>
              setCollapsed(
                (value) => !value
              )
            }
            count={children.length}
          />
        </>
      )}

      {/* ========================================================
          CHILDREN
      ========================================================= */}
      {!collapsed && (
        <div className="animate-[fadeIn_0.25s_ease-out]">

          <ChildrenRow
            items={children}
            searchTerm={searchTerm}
            focusedMemberId={
              focusedMemberId
            }
            onFocusMember={
              onFocusMember
            }
          />

        </div>
      )}

    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* MULTIPLE MARRIAGES                                                         */
/* -------------------------------------------------------------------------- */

const MultipleMarriages = ({
  node,
  searchTerm,
  focusedMemberId,
  onFocusMember,
}: {
  node: TreeNode;
  searchTerm?: string;
  focusedMemberId?: string | null;
  onFocusMember?: (memberId: string) => void;
}) => {
  const [collapsed, setCollapsed] =
    useState(false);

  const marriages =
    (node.marriages || []).filter(
      (marriage) =>
        marriage &&
        marriage.spouse1 &&
        marriage.spouse2 &&
        (
          marriage.spouse1.id ===
            node.member.id ||
          marriage.spouse2.id ===
            node.member.id
        )
    );

  const getSpouse = (
    marriage: MarriageGroup
  ) =>
    marriage.spouse1.id ===
    node.member.id
      ? marriage.spouse2
      : marriage.spouse1;

  const totalChildren =
    marriages.reduce(
      (total, marriage) =>
        total +
        new Set(
          (marriage.children || []).map(
            (child) =>
              child.member.id
          )
        ).size,
      0
    );

  return (
    <div className="flex flex-col items-center">

      {/* ========================================================
          MAIN PERSON
          Appears exactly once
      ========================================================= */}
      <PersonCard
        member={node.member}
        searchTerm={searchTerm}
        focusedMemberId={focusedMemberId}
        onFocusMember={onFocusMember}
      />

      {/* ========================================================
          MARRIAGE BRANCH TOGGLE
      ========================================================= */}
      {marriages.length > 0 && (
        <>
          <div className="h-7 w-px bg-[#AFC4D8]" />

          <CollapseButton
            collapsed={collapsed}
            onClick={() =>
              setCollapsed(
                (value) => !value
              )
            }
            count={marriages.length}
          />
        </>
      )}

      {/* ========================================================
          MARRIAGE BRANCHES
      ========================================================= */}
      {!collapsed && (
        <div
          className="
            mt-4 flex max-w-[1100px]
            flex-wrap items-start
            justify-center
            gap-x-4 gap-y-8
            sm:gap-x-8
          "
        >

          {marriages.map(
            (marriage) => {
              const spouse =
                getSpouse(marriage);

              const children =
                Array.from(
                  new Map(
                    (
                      marriage.children ||
                      []
                    )
                      .filter(
                        (child) =>
                          child &&
                          child.member &&
                          child.member.id !==
                            node.member.id &&
                          child.member.id !==
                            spouse.id
                      )
                      .map(
                        (child) => [
                          child.member.id,
                          child,
                        ]
                      )
                  ).values()
                );

              return (
                <div
                  key={marriage.id}
                  className="
                    relative flex
                    min-w-[250px]
                    flex-col items-center
                    rounded-[1.25rem]
                    border
                    border-[#D9E4F0]
                    bg-gradient-to-br
                    from-white
                    via-[#F8FBFF]
                    to-[#F7F1FF]
                    px-4 py-5
                    shadow-sm
                    transition-all duration-300
                    hover:border-[#AFCBE5]
                    hover:shadow-md
                  "
                >

                  {/* Branch label */}
                  <div className="absolute left-3 top-3">

                    <span
                      className="
                        rounded-full
                        bg-[#D0E6FF]/70
                        px-2 py-1
                        text-[8px]
                        font-bold
                        uppercase
                        tracking-wider
                        text-[#023570]
                      "
                    >
                      Marriage
                    </span>

                  </div>

                  {/* Couple */}
                  <div className="mt-3 flex items-center">

                    <PersonCard
                      member={node.member}
                      searchTerm={
                        searchTerm
                      }
                      focusedMemberId={
                        focusedMemberId
                      }
                      onFocusMember={
                        onFocusMember
                      }
                    />

                    <MarriageConnection />

                    <PersonCard
                      member={spouse}
                      searchTerm={
                        searchTerm
                      }
                      focusedMemberId={
                        focusedMemberId
                      }
                      onFocusMember={
                        onFocusMember
                      }
                    />

                  </div>

                  {/* Children */}
                  {children.length > 0 && (
                    <ChildrenRow
                      items={children}
                      searchTerm={
                        searchTerm
                      }
                      focusedMemberId={
                        focusedMemberId
                      }
                      onFocusMember={
                        onFocusMember
                      }
                    />
                  )}

                </div>
              );
            }
          )}

        </div>
      )}

      {/* ========================================================
          COLLAPSED SUMMARY
      ========================================================= */}
      {collapsed &&
        totalChildren > 0 && (
          <p className="mt-2 text-[10px] text-[#7A8A9A]">
            Marriage branches collapsed
          </p>
        )}

    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* MAIN FAMILY TREE NODE                                                      */
/* -------------------------------------------------------------------------- */

export function FamilyTreeNode({
  node,
  isRoot = false,
  searchTerm = '',
  focusedMemberId = null,
  onFocusMember,
}: FamilyTreeNodeProps) {
  if (!node || !node.member) {
    return null;
  }

  const marriages =
    Array.isArray(node.marriages)
      ? node.marriages.filter(
          (marriage) =>
            marriage &&
            marriage.spouse1 &&
            marriage.spouse2 &&
            (
              marriage.spouse1.id ===
                node.member.id ||
              marriage.spouse2.id ===
                node.member.id
            )
        )
      : [];

  /* ============================================================
     NO MARRIAGE
  ============================================================ */
  if (marriages.length === 0) {
    return (
      <div
        className={`
          flex flex-col items-center
          ${isRoot ? 'pt-2' : ''}
        `}
      >

        <PersonCard
          member={node.member}
          searchTerm={searchTerm}
          focusedMemberId={
            focusedMemberId
          }
          onFocusMember={
            onFocusMember
          }
        />

        {node.marriages?.some(
          (marriage) =>
            marriage.children?.length
        ) && (
          <ChildrenRow
            items={node.marriages.flatMap(
              (marriage) =>
                marriage.children || []
            )}
            searchTerm={searchTerm}
            focusedMemberId={
              focusedMemberId
            }
            onFocusMember={
              onFocusMember
            }
          />
        )}

      </div>
    );
  }

  /* ============================================================
     ONE MARRIAGE
  ============================================================ */
  if (marriages.length === 1) {
    return (
      <div
        className={`
          flex flex-col items-center
          ${isRoot ? 'pt-2' : ''}
        `}
      >

        <SingleMarriage
          node={node}
          marriage={marriages[0]}
          searchTerm={searchTerm}
          focusedMemberId={
            focusedMemberId
          }
          onFocusMember={
            onFocusMember
          }
        />

      </div>
    );
  }

  /* ============================================================
     MULTIPLE MARRIAGES
  ============================================================ */
  return (
    <div
      className={`
        flex flex-col items-center
        ${isRoot ? 'pt-2' : ''}
      `}
    >

      <MultipleMarriages
        node={node}
        searchTerm={searchTerm}
        focusedMemberId={
          focusedMemberId
        }
        onFocusMember={
          onFocusMember
        }
      />

    </div>
  );
}

export default FamilyTreeNode;