
export type DbMember = {
  id: string;
  name: string;
  role: string;
  image: string;
  dateOfPassing?: string | null;
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

type FamilyTreeNodeProps = {
  node?: TreeNode;
  isRoot?: boolean;
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return '?';

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

/* -------------------------------------------------------------------------- */
/* Person Card                                                                */
/* -------------------------------------------------------------------------- */

const FamilyTreeCard = ({
  member,
}: {
  member: DbMember;
}) => {
  const isDeceased = Boolean(member.dateOfPassing);

  return (
    <div className="w-[180px] rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-2">
          <div className="h-16 w-16 overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-md">
            {member.image ? (
              <img
                src={member.image}
                alt={member.name}
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                  const fallback =
                    event.currentTarget.parentElement?.querySelector(
                      '[data-fallback]'
                    ) as HTMLElement | null;

                  if (fallback) {
                    fallback.style.display = 'flex';
                  }
                }}
              />
            ) : null}

            <div
              data-fallback
              className={`h-full w-full items-center justify-center bg-gray-100 text-sm font-bold text-gray-500 ${
                member.image ? 'hidden' : 'flex'
              }`}
            >
              {getInitials(member.name)}
            </div>
          </div>

          {isDeceased && (
            <div
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-700 text-xs text-white"
              title="Passed away"
            >
              †
            </div>
          )}
        </div>

        <p className="line-clamp-2 text-sm font-bold leading-tight text-gray-900">
          {member.name}
        </p>

        {member.role && (
          <p className="mt-1 line-clamp-1 text-xs text-gray-500">
            {member.role}
          </p>
        )}

        {isDeceased && (
          <p className="mt-1 text-[10px] italic text-gray-400">
            In loving memory
          </p>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Love connection                                                            */
/* -------------------------------------------------------------------------- */

const LoveConnection = () => {
  return (
    <div className="flex w-16 shrink-0 flex-col items-center justify-center">
      <div className="h-px w-16 bg-gray-300" />

      <div className="-my-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-white text-xl shadow-sm">
        ❤️
      </div>

      <div className="h-px w-16 bg-gray-300" />
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Children connector                                                         */
/* -------------------------------------------------------------------------- */

const ChildrenConnector = ({
  count,
}: {
  count: number;
}) => {
  if (count <= 0) return null;

  return (
    <div className="flex flex-col items-center">
      <div className="h-8 w-px bg-gray-300" />

      <div className="relative h-5 w-full min-w-[220px]">
        {count === 1 ? (
          <div className="absolute left-1/2 top-0 h-5 w-px -translate-x-1/2 bg-gray-300" />
        ) : (
          <>
            <div className="absolute left-1/2 top-0 h-px w-[calc(100%-90px)] -translate-x-1/2 bg-gray-300" />

            <div className="absolute left-1/2 top-0 h-5 w-px -translate-x-1/2 bg-gray-300" />
          </>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Child node                                                                 */
/* -------------------------------------------------------------------------- */

const ChildNode = ({
  child,
}: {
  child: TreeNode;
}) => {
  if (!child || !child.member) {
    return null;
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="absolute left-1/2 top-0 h-5 w-px -translate-x-1/2 bg-gray-300" />

        <div className="pt-5">
          <FamilyTreeNode node={child} />
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Children area                                                              */
/* -------------------------------------------------------------------------- */

const ChildrenArea = ({
  children,
}: {
  children: TreeNode[];
}) => {
  const validChildren = children.filter(
    (child) => Boolean(child?.member)
  );

  if (validChildren.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center">
      <ChildrenConnector count={validChildren.length} />

      <div
        className={`flex items-start justify-center gap-8 ${
          validChildren.length > 4
            ? 'flex-wrap max-w-[1100px]'
            : 'flex-nowrap'
        }`}
      >
        {validChildren.map((child) => (
          <ChildNode
            key={child.member.id}
            child={child}
          />
        ))}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Marriage unit                                                              */
/* -------------------------------------------------------------------------- */

const MarriageUnit = ({
  marriage,
}: {
  marriage: MarriageGroup;
}) => {
  if (!marriage?.spouse1 || !marriage?.spouse2) {
    return null;
  }

  const validChildren = (marriage.children || []).filter(
    (child) => Boolean(child?.member)
  );

  return (
    <div className="flex flex-col items-center">
      {/* Husband + Wife + Heart */}
      <div className="flex items-center justify-center">
        <FamilyTreeCard member={marriage.spouse1} />

        <LoveConnection />

        <FamilyTreeCard member={marriage.spouse2} />
      </div>

      {/* Children from this specific marriage */}
      {validChildren.length > 0 && (
        <ChildrenArea children={validChildren} />
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Unmarried person                                                            */
/* -------------------------------------------------------------------------- */

const UnmarriedNode = ({
  member,
}: {
  member: DbMember;
}) => {
  if (!member) {
    return null;
  }

  return (
    <div className="flex flex-col items-center">
      <FamilyTreeCard member={member} />
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Main recursive family tree node                                             */
/* -------------------------------------------------------------------------- */

const FamilyTreeNode = ({
  node,
  isRoot = false,
}: FamilyTreeNodeProps) => {
  /*
   * IMPORTANT:
   *
   * The node prop is optional here intentionally.
   * PortalPage can never crash the entire Family Tree if an unexpected
   * undefined node appears in the relationship data.
   */
  if (!node || !node.member) {
    return null;
  }

  const marriages = Array.isArray(node.marriages)
    ? node.marriages.filter(
        (marriage) =>
          Boolean(marriage?.spouse1) &&
          Boolean(marriage?.spouse2)
      )
    : [];

  return (
    <li
      className={`flex flex-col items-center ${
        isRoot ? 'list-none' : ''
      }`}
    >
      {/* If this person has no marriages, show them alone */}
      {marriages.length === 0 ? (
        <UnmarriedNode member={node.member} />
      ) : (
        /*
         * Each marriage is rendered as a completely separate unit.
         *
         * This is what allows:
         *
         * Person
         *   ├── Marriage 1 ❤️ Children
         *   └── Marriage 2 ❤️ Children
         *
         * without mixing children from different marriages.
         */
        <div className="flex flex-col items-center gap-12">
          {marriages.map((marriage) => (
            <MarriageUnit
              key={marriage.id}
              marriage={marriage}
            />
          ))}
        </div>
      )}
    </li>
  );
};

export default FamilyTreeNode;