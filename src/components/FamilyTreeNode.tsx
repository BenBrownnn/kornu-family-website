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

const BLUE = '#0077B6';



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

  const normalizedName = member.name?.toLowerCase() ?? '';
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const isMatch =
    normalizedSearch.length > 0 &&
    normalizedName.includes(normalizedSearch);

  const isHighlighted = isFocused || isMatch;

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
        group relative flex w-[125px] flex-col items-center text-center
        transition-all duration-300 ease-out
        ${isFocused ? 'scale-105' : 'hover:-translate-y-1'}
      `}
    >
      {/* Focus button */}
      {onFocusMember && (
        <button
          type="button"
          onClick={handleFocus}
          title={`Focus on ${member.name}`}
          className="
            absolute right-1 top-0 z-20
            flex h-7 w-7 items-center justify-center
            rounded-full border border-gray-200 bg-white
            text-gray-400 shadow-sm
            opacity-0 transition-all duration-200
            hover:border-[#0077B6] hover:text-[#0077B6]
            group-hover:opacity-100
            focus:opacity-100
          "
        >
          <LocateFixed size={13} />
        </button>
      )}

      {/* Photo */}
      <div
        className={`
          relative h-[82px] w-[82px] overflow-hidden rounded-full
          border-[3px] bg-white shadow-sm
          transition-all duration-300
          ${
            isDeceased
              ? 'border-gray-300 grayscale'
              : 'border-white ring-2 ring-gray-100'
          }
          ${
            isMatch
              ? 'ring-4 ring-[#0077B6]/30 scale-105'
              : ''
          }
          ${
            isFocused
              ? 'ring-4 ring-[#0077B6]/40 shadow-lg'
              : ''
          }
        `}
        style={{
          borderColor:
            isFocused || isMatch ? BLUE : undefined,
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
              flex h-full w-full items-center justify-center
              text-lg font-bold
              ${
                isDeceased
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-blue-50 text-[#0077B6]'
              }
            `}
          >
            {initials || '?'}
            <div className="relative">
            </div>
          </div>
        )}
      </div>

      {/* Name */}
      <p
        className={`
          mt-2 line-clamp-2 max-w-[125px]
          text-xs font-bold leading-tight
          transition-colors duration-200
          ${
            isHighlighted
              ? 'text-[#0077B6]'
              : 'text-gray-800'
          }
        `}
      >
        {member.name}
      </p>

      {/* Role */}
      {member.role && (
        <p className="mt-1 line-clamp-1 max-w-[125px] text-[10px] text-gray-400">
          {member.role}
        </p>
      )}

      {/* Deceased label */}
      {isDeceased && (
        <p className="mt-1 flex items-center gap-1 text-[9px] italic text-gray-400">
          <span aria-hidden="true">🕊️</span>
          <span>In loving memory</span>
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
    <div className="h-px w-8 bg-gray-300 sm:w-10" />

    <div
      className="
        mx-1 flex h-8 w-8 shrink-0 items-center
        justify-center rounded-full
        border-2 border-[#0077B6]
        bg-white text-[15px]
        shadow-sm
      "
      title="Marriage"
    >
      💍
    </div>

    <div className="h-px w-8 bg-gray-300 sm:w-10" />
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
      title={collapsed ? 'Expand descendants' : 'Collapse descendants'}
      className="
        relative z-20 mt-2 flex items-center gap-1
        rounded-full border border-gray-200
        bg-white px-2.5 py-1
        text-[10px] font-medium text-gray-500
        shadow-sm transition-all duration-200
        hover:border-[#0077B6]
        hover:text-[#0077B6]
      "
    >
      {collapsed ? (
        <ChevronRight size={12} />
      ) : (
        <ChevronDown size={12} />
      )}

      {count} {count === 1 ? 'member' : 'members'}
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
        .filter((child) => child && child.member)
        .map((child) => [child.member.id, child])
    ).values()
  );

  if (validChildren.length === 0) return null;

  /* Single child */
  if (validChildren.length === 1) {
    return (
      <div className="flex flex-col items-center">
        <div className="h-8 w-px bg-gray-300" />

        <FamilyTreeNode
          node={validChildren[0]}
          searchTerm={searchTerm}
          focusedMemberId={focusedMemberId}
          onFocusMember={onFocusMember}
        />
      </div>
    );
  }

  /* Multiple children */
  return (
    <div className="flex flex-col items-center">
      {/* Parent → children vertical line */}
      <div className="h-8 w-px bg-gray-300" />

      <div className="relative">
        {/* Horizontal generation connector */}
        <div
          className="
            absolute left-1/2 top-0
            h-px -translate-x-1/2
            bg-gray-300
          "
          style={{
            width: `calc(100% - 125px)`,
          }}
        />

        <div className="flex items-start justify-center gap-5 sm:gap-8">
          {validChildren.map((child) => (
            <div
              key={child.member.id}
              className="relative flex flex-col items-center"
            >
              <div className="h-6 w-px bg-gray-300" />

              <FamilyTreeNode
                node={child}
                searchTerm={searchTerm}
                focusedMemberId={focusedMemberId}
                onFocusMember={onFocusMember}
              />
            </div>
          ))}
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
  const [collapsed, setCollapsed] = useState(false);

  const spouse =
    marriage.spouse1.id === node.member.id
      ? marriage.spouse2
      : marriage.spouse1;

  const children = Array.from(
    new Map(
      (marriage.children || [])
        .filter((child) => child && child.member)
        .map((child) => [child.member.id, child])
    ).values()
  );

  return (
    <div className="flex flex-col items-center">
      {/* Couple */}
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

      {/* Children toggle */}
      {children.length > 0 && (
        <>
          <div className="h-4 w-px bg-gray-300" />

          <CollapseButton
            collapsed={collapsed}
            onClick={() => setCollapsed((value) => !value)}
            count={children.length}
          />
        </>
      )}

      {!collapsed && (
        <div className="animate-[fadeIn_0.25s_ease-out]">
          <ChildrenRow
            items={children}
            searchTerm={searchTerm}
            focusedMemberId={focusedMemberId}
            onFocusMember={onFocusMember}
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
  const [collapsed, setCollapsed] = useState(false);

  const marriages = (node.marriages || []).filter(
    (marriage) =>
      marriage &&
      marriage.spouse1 &&
      marriage.spouse2 &&
      (marriage.spouse1.id === node.member.id ||
        marriage.spouse2.id === node.member.id)
  );

  const getSpouse = (marriage: MarriageGroup) =>
    marriage.spouse1.id === node.member.id
      ? marriage.spouse2
      : marriage.spouse1;

  const totalChildren = marriages.reduce(
    (total, marriage) =>
      total + new Set(
        (marriage.children || []).map(
          (child) => child.member.id
        )
      ).size,
    0
  );

  return (
    <div className="flex flex-col items-center">
      {/* Main person appears exactly once */}
      <PersonCard
        member={node.member}
        searchTerm={searchTerm}
        focusedMemberId={focusedMemberId}
        onFocusMember={onFocusMember}
      />

      {/* Marriage branches */}
      {marriages.length > 0 && (
        <>
          <div className="h-7 w-px bg-gray-300" />

          <CollapseButton
            collapsed={collapsed}
            onClick={() => setCollapsed((value) => !value)}
            count={marriages.length}
          />
        </>
      )}

      {!collapsed && (
        <div
          className="
            mt-3 flex max-w-[1100px]
            flex-wrap items-start justify-center
            gap-x-4 gap-y-8
            sm:gap-x-8
          "
        >
          {marriages.map((marriage) => {
            const spouse = getSpouse(marriage);

            const children = Array.from(
              new Map(
                (marriage.children || [])
                  .filter(
                    (child) =>
                      child &&
                      child.member &&
                      child.member.id !== node.member.id &&
                      child.member.id !== spouse.id
                  )
                  .map((child) => [
                    child.member.id,
                    child,
                  ])
              ).values()
            );

            return (
              <div
                key={marriage.id}
                className="
                  relative flex min-w-[250px]
                  flex-col items-center
                  rounded-2xl border border-gray-100
                  bg-gray-50/60 px-4 py-4
                  transition-all duration-300
                  hover:border-blue-100
                  hover:bg-blue-50/30
                "
              >
                {/* Marriage connection */}
                <div className="flex items-center">
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

                {children.length > 0 && (
                  <ChildrenRow
                    items={children}
                    searchTerm={searchTerm}
                    focusedMemberId={focusedMemberId}
                    onFocusMember={onFocusMember}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Extra relationship summary */}
      {collapsed && totalChildren > 0 && (
        <p className="mt-2 text-[10px] text-gray-400">
          Branches collapsed
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
  if (!node || !node.member) return null;

  const marriages = Array.isArray(node.marriages)
    ? node.marriages.filter(
        (marriage) =>
          marriage &&
          marriage.spouse1 &&
          marriage.spouse2 &&
          (marriage.spouse1.id === node.member.id ||
            marriage.spouse2.id === node.member.id)
      )
    : [];

  /* No marriage */
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
          focusedMemberId={focusedMemberId}
          onFocusMember={onFocusMember}
        />
        

        {node.marriages?.some(
          (marriage) => marriage.children?.length
        ) && (
          <ChildrenRow
            items={node.marriages.flatMap(
              (marriage) => marriage.children || []
            )}
            searchTerm={searchTerm}
            focusedMemberId={focusedMemberId}
            onFocusMember={onFocusMember}
          />
        )}
      </div>
    );
  }

  /* One marriage */
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
          focusedMemberId={focusedMemberId}
          onFocusMember={onFocusMember}
        />
      </div>
    );
  }

  /* Multiple marriages */
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
        focusedMemberId={focusedMemberId}
        onFocusMember={onFocusMember}
      />
    </div>
  );
};

export default FamilyTreeNode;