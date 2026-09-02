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
/* Person card                                                                */
/* -------------------------------------------------------------------------- */

const PersonCard = ({ member }: { member: DbMember }) => {
  if (!member) return null;

  const initials = member.name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();

  return (
    <div className="w-[180px] rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-2 h-16 w-16 overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-md">
          {member.image ? (
            <img
              src={member.image}
              alt={member.name}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = 'none';

                const fallback =
                  event.currentTarget.parentElement?.querySelector(
                    '[data-initials]'
                  ) as HTMLElement | null;

                if (fallback) {
                  fallback.style.display = 'flex';
                }
              }}
            />
          ) : null}

          <div
            data-initials
            className={`h-full w-full items-center justify-center bg-gray-100 text-sm font-bold text-gray-500 ${
              member.image ? 'hidden' : 'flex'
            }`}
          >
            {initials || '?'}
          </div>
        </div>

        <p className="line-clamp-2 text-sm font-bold leading-tight text-gray-900">
          {member.name}
        </p>

        {member.role && (
          <p className="mt-1 line-clamp-1 text-xs text-gray-500">
            {member.role}
          </p>
        )}

        {member.dateOfPassing && (
          <p className="mt-1 text-[10px] italic text-gray-400">
            In loving memory
          </p>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Heart                                                                      */
/* -------------------------------------------------------------------------- */

const Heart = () => (
  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white text-xl shadow-md">
    ❤️
  </div>
);

/* -------------------------------------------------------------------------- */
/* Central person with one marriage                                           */
/* -------------------------------------------------------------------------- */

const SingleMarriage = ({
  node,
  marriage,
}: {
  node: TreeNode;
  marriage: MarriageGroup;
}) => {
  if (!marriage?.spouse1 || !marriage?.spouse2) {
    return null;
  }

  /*
   * The central person must appear only once.
   *
   * Determine which side the spouse belongs on.
   */
  const centralPerson = node.member;

  const spouse =
    marriage.spouse1.id === centralPerson.id
      ? marriage.spouse2
      : marriage.spouse1;

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-center">
        <PersonCard member={centralPerson} />

        <div className="mx-4 flex items-center">
          <div className="h-px w-10 bg-gray-300" />
          <Heart />
          <div className="h-px w-10 bg-gray-300" />
        </div>

        <PersonCard member={spouse} />
      </div>

      <MarriageChildren marriage={marriage} />
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Multiple marriages                                                         */
/*                                                                            */
/*                         CENTRAL PERSON                                     */
/*                              │                                             */
/*                 ┌────────────┴────────────┐                               */
/*                 │                         │                               */
/*              Spouse 1                  Spouse 2                           */
/*                 ❤️                         ❤️                              */
/*                 │                         │                               */
/*              Children                  Children                           */
/* -------------------------------------------------------------------------- */

const MultipleMarriages = ({
  node,
}: {
  node: TreeNode;
}) => {
  const marriages = node.marriages.filter(
    (marriage) =>
      marriage &&
      marriage.spouse1 &&
      marriage.spouse2 &&
      (marriage.spouse1.id === node.member.id ||
        marriage.spouse2.id === node.member.id)
  );

  if (marriages.length === 0) {
    return <PersonCard member={node.member} />;
  }

  /*
   * IMPORTANT:
   *
   * The central person is rendered ONCE.
   * Spouses are rendered around that single person.
   *
   * This prevents:
   *
   * Daughter
   * Husband 1
   * Daughter
   * Husband 2
   *
   * and instead produces:
   *
   *              Daughter
   *                 │
   *       ┌─────────┴─────────┐
   *       │                   │
   *   Husband 1           Husband 2
   */

  const leftMarriage = marriages[0];
  const rightMarriages = marriages.slice(1);

  const getSpouse = (marriage: MarriageGroup) =>
    marriage.spouse1.id === node.member.id
      ? marriage.spouse2
      : marriage.spouse1;

  return (
    <div className="flex flex-col items-center">
      {/* Central person */}
      <PersonCard member={node.member} />

      {/* Main branching line */}
      <div className="h-8 w-px bg-gray-300" />

      <div className="relative flex items-start justify-center gap-12">
        {/* Horizontal branch */}
        {marriages.length > 1 && (
          <div className="absolute left-1/2 right-1/2 top-0 h-px w-[calc(100%-180px)] -translate-x-1/2 bg-gray-300" />
        )}

        {/* Left marriage */}
        <MarriageBranch
          marriage={leftMarriage}
          spouse={getSpouse(leftMarriage)}
        />

        {/* Right marriages */}
        {rightMarriages.map((marriage) => (
          <MarriageBranch
            key={marriage.id}
            marriage={marriage}
            spouse={getSpouse(marriage)}
          />
        ))}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Individual marriage branch                                                 */
/* -------------------------------------------------------------------------- */

const MarriageBranch = ({
  marriage,
  spouse,
}: {
  marriage: MarriageGroup;
  spouse: DbMember;
}) => {
  if (!marriage || !spouse) {
    return null;
  }

  const children = (marriage.children || []).filter(
    (child) => child && child.member
  );

  return (
    <div className="flex min-w-[220px] flex-col items-center">
      {/* Connection from central person */}
      <div className="h-5 w-px bg-gray-300" />

      {/* Spouse */}
      <PersonCard member={spouse} />

      {/* Heart directly below spouse */}
      <div className="relative flex flex-col items-center">
        <div className="h-4 w-px bg-gray-300" />
        <Heart />
      </div>

      {/* Children */}
      {children.length > 0 && (
        <div className="flex flex-col items-center">
          <div className="h-5 w-px bg-gray-300" />

          {children.length === 1 ? (
            <div className="flex flex-col items-center">
              <div className="h-5 w-px bg-gray-300" />

              <FamilyTreeNode
                key={children[0].member.id}
                node={children[0]}
              />
            </div>
          ) : (
            <div className="relative pt-5">
              {/* Children horizontal line */}
              <div className="absolute left-1/2 top-0 h-px w-[calc(100%-80px)] -translate-x-1/2 bg-gray-300" />

              <div className="flex items-start justify-center gap-8">
                {children.map((child) => (
                  <div
                    key={child.member.id}
                    className="relative flex flex-col items-center"
                  >
                    <div className="absolute left-1/2 top-0 h-5 w-px -translate-x-1/2 bg-gray-300" />

                    <div className="pt-5">
                      <FamilyTreeNode node={child} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Children belonging to a single marriage                                   */
/* -------------------------------------------------------------------------- */

const MarriageChildren = ({
  marriage,
}: {
  marriage: MarriageGroup;
}) => {
  const children = (marriage.children || []).filter(
    (child) => child && child.member
  );

  if (children.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-col items-center">
      <div className="h-8 w-px bg-gray-300" />

      {children.length === 1 ? (
        <FamilyTreeNode node={children[0]} />
      ) : (
        <div className="relative pt-5">
          <div className="absolute left-1/2 top-0 h-px w-[calc(100%-100px)] -translate-x-1/2 bg-gray-300" />

          <div className="flex items-start justify-center gap-10">
            {children.map((child) => (
              <div
                key={child.member.id}
                className="relative flex flex-col items-center"
              >
                <div className="absolute left-1/2 top-0 h-5 w-px -translate-x-1/2 bg-gray-300" />

                <div className="pt-5">
                  <FamilyTreeNode node={child} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Main component                                                              */
/* -------------------------------------------------------------------------- */

const FamilyTreeNode = ({
  node,
  isRoot = false,
}: FamilyTreeNodeProps) => {
  if (!node || !node.member) {
    return null;
  }

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

  /*
   * No spouse:
   *
   * Just show the person.
   */
  if (marriages.length === 0) {
    return (
      <div className="flex flex-col items-center">
        <PersonCard member={node.member} />
      </div>
    );
  }

  /*
   * One spouse:
   *
   * Person ❤️ Spouse
   */
  if (marriages.length === 1) {
    return (
      <div className="flex flex-col items-center">
        <SingleMarriage
          node={node}
          marriage={marriages[0]}
        />
      </div>
    );
  }

  /*
   * Multiple spouses:
   *
   *                 PERSON
   *                    │
   *       ┌────────────┴────────────┐
   *       │                         │
   *    SPOUSE 1                  SPOUSE 2
   *       ❤️                         ❤️
   *       │                         │
   *    CHILDREN                  CHILDREN
   *
   * The person is rendered exactly ONCE.
   */
  return (
    <div
      className={`flex flex-col items-center ${
        isRoot ? 'pt-2' : ''
      }`}
    >
      <MultipleMarriages node={node} />
    </div>
  );
};

export default FamilyTreeNode;