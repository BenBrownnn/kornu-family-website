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
/* Person Card                                                                */
/* -------------------------------------------------------------------------- */

const PersonCard = ({ member }: { member: DbMember }) => {
  if (!member) return null;

  const initials = member.name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
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
                event.currentTarget.style.display = "none";

                const fallback =
                  event.currentTarget.parentElement?.querySelector(
                    "[data-initials]"
                  ) as HTMLElement | null;

                if (fallback) {
                  fallback.style.display = "flex";
                }
              }}
            />
          ) : null}

          <div
            data-initials
            className={`h-full w-full items-center justify-center bg-gray-100 text-sm font-bold text-gray-500 ${
              member.image ? "hidden" : "flex"
            }`}
          >
            {initials || "?"}
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
  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white text-xl shadow-md">
    ❤️
  </div>
);

/* -------------------------------------------------------------------------- */
/* Children                                                                    */
/* -------------------------------------------------------------------------- */

const ChildrenRow = ({
  children,
}: {
  children: TreeNode[];
}) => {
  const validChildren = (children || []).filter(
    (child) => child && child.member
  );

  if (validChildren.length === 0) {
    return null;
  }

  /* One child */
  if (validChildren.length === 1) {
    return (
      <div className="flex flex-col items-center">
        <div className="h-8 w-px bg-gray-300" />

        <FamilyTreeNode node={validChildren[0]} />
      </div>
    );
  }

  /* Multiple children */
  return (
    <div className="flex flex-col items-center">
      <div className="h-8 w-px bg-gray-300" />

      <div className="relative">
        {/* Horizontal connection between children */}
        <div className="absolute left-1/2 top-0 h-px w-[calc(100%-180px)] -translate-x-1/2 bg-gray-300" />

        <div className="flex items-start justify-center gap-8">
          {validChildren.map((child) => (
            <div
              key={child.member.id}
              className="relative flex flex-col items-center"
            >
              {/* Vertical connection to horizontal line */}
              <div className="h-6 w-px bg-gray-300" />

              <FamilyTreeNode node={child} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Single Marriage                                                            */
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

  const centralPerson = node.member;

  const spouse =
    marriage.spouse1.id === centralPerson.id
      ? marriage.spouse2
      : marriage.spouse1;

  return (
    <div className="flex flex-col items-center">
      {/* Couple */}
      <div className="flex items-center justify-center">
        <PersonCard member={centralPerson} />

        <div className="mx-4 flex items-center">
          <div className="h-px w-10 bg-gray-300" />

          <Heart />

          <div className="h-px w-10 bg-gray-300" />
        </div>

        <PersonCard member={spouse} />
      </div>

      {/* Children */}
      <ChildrenRow children={marriage.children || []} />
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Multiple Marriages                                                         */
/*                                                                            */
/*                         DAUGHTER                                           */
/*                            │                                               */
/*                            │                                               */
/*                    ─────── ❤️ ───────                                      */
/*                    │                 │                                     */
/*                HUSBAND 1         HUSBAND 2                                */
/*                    │                 │                                     */
/*                CHILDREN          CHILDREN                                 */
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

  const getSpouse = (marriage: MarriageGroup) =>
    marriage.spouse1.id === node.member.id
      ? marriage.spouse2
      : marriage.spouse1;

  /*
   * For multiple marriages we deliberately use only TWO spouse positions:
   *
   *                 PERSON
   *                    │
   *                    │
   *             ───────❤️───────
   *             │              │
   *          SPOUSE 1       SPOUSE 2
   *
   * This prevents the central person and relationship
   * from being duplicated for every marriage.
   */

  const firstMarriage = marriages[0];
  const secondMarriage = marriages[1];

  const firstSpouse = getSpouse(firstMarriage);
  const secondSpouse = secondMarriage
    ? getSpouse(secondMarriage)
    : null;

  /*
   * If there is only one valid marriage, use the
   * normal single-marriage layout.
   */
  if (!secondSpouse) {
    return (
      <SingleMarriage
        node={node}
        marriage={firstMarriage}
      />
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* ------------------------------------------------------------------ */}
      {/* CENTRAL PERSON                                                      */}
      {/* ------------------------------------------------------------------ */}

      <PersonCard member={node.member} />

      {/* Daughter → relationship connection */}
      <div className="h-8 w-px bg-gray-300" />

      {/* ------------------------------------------------------------------ */}
      {/* CENTRAL RELATIONSHIP                                                */}
      {/* ------------------------------------------------------------------ */}

      <div className="relative flex items-start justify-center">
        {/* The single horizontal relationship line */}
        <div className="absolute left-[90px] right-[90px] top-5 h-px bg-gray-300" />

        {/* LEFT SPOUSE */}
        <div className="relative flex w-[250px] flex-col items-center">
          {/* Connection from horizontal relationship line */}
          <div className="h-5 w-px bg-gray-300" />

          <PersonCard member={firstSpouse} />

          {/* Children */}
          <ChildrenRow children={firstMarriage.children || []} />
        </div>

        {/* CENTRAL HEART */}
        <div className="relative z-20 flex w-[80px] flex-col items-center">
          <Heart />
        </div>

        {/* RIGHT SPOUSE */}
        <div className="relative flex w-[250px] flex-col items-center">
          {/* Connection from horizontal relationship line */}
          <div className="h-5 w-px bg-gray-300" />

          <PersonCard member={secondSpouse} />

          {/* Children */}
          <ChildrenRow children={secondMarriage.children || []} />
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* ADDITIONAL MARRIAGES                                                */}
      {/* ------------------------------------------------------------------ */}

      {marriages.length > 2 && (
        <div className="mt-8 flex flex-col items-center">
          <div className="mb-4 text-xs font-medium text-gray-400">
            Additional relationships
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {marriages.slice(2).map((marriage) => {
              const spouse = getSpouse(marriage);

              return (
                <div
                  key={marriage.id}
                  className="flex flex-col items-center"
                >
                  <div className="flex items-center">
                    <Heart />
                  </div>

                  <div className="mt-3">
                    <PersonCard member={spouse} />
                  </div>

                  <ChildrenRow children={marriage.children || []} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Main Family Tree Node                                                      */
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

  /* No spouse */
  if (marriages.length === 0) {
    return (
      <div
        className={`flex flex-col items-center ${
          isRoot ? "pt-2" : ""
        }`}
      >
        <PersonCard member={node.member} />
      </div>
    );
  }

  /* One spouse */
  if (marriages.length === 1) {
    return (
      <div
        className={`flex flex-col items-center ${
          isRoot ? "pt-2" : ""
        }`}
      >
        <SingleMarriage
          node={node}
          marriage={marriages[0]}
        />
      </div>
    );
  }

  /* Multiple spouses */
  return (
    <div
      className={`flex flex-col items-center ${
        isRoot ? "pt-2" : ""
      }`}
    >
      <MultipleMarriages node={node} />
    </div>
  );
};

export default FamilyTreeNode;