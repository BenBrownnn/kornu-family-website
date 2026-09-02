
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
/* PERSON CARD                                                                */
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
/* HEART                                                                      */
/* -------------------------------------------------------------------------- */

const Heart = () => (
  <div className="relative z-20 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white text-xl shadow-md">
    ❤️
  </div>
);

/* -------------------------------------------------------------------------- */
/* CHILDREN                                                                   */
/* -------------------------------------------------------------------------- */

const ChildrenRow = ({
  items,
}: {
  items: TreeNode[];
}) => {
  const validChildren = (items || []).filter(
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
        <div className="absolute left-1/2 top-0 h-px w-[calc(100%-180px)] -translate-x-1/2 bg-gray-300" />

        <div className="flex items-start justify-center gap-8">
          {validChildren.map((child) => (
            <div
              key={child.member.id}
              className="relative flex flex-col items-center"
            >
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
/* SINGLE MARRIAGE                                                            */
/* -------------------------------------------------------------------------- */

const SingleMarriage = ({
  node,
  marriage,
}: {
  node: TreeNode;
  marriage: MarriageGroup;
}) => {
  const spouse =
    marriage.spouse1.id === node.member.id
      ? marriage.spouse2
      : marriage.spouse1;

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-center">
        <PersonCard member={node.member} />

        <div className="mx-4 flex items-center">
          <div className="h-px w-10 bg-gray-300" />

          <Heart />

          <div className="h-px w-10 bg-gray-300" />
        </div>

        <PersonCard member={spouse} />
      </div>
<ChildrenRow items={marriage.children || []} />
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* MULTIPLE MARRIAGES                                                         */
/*                                                                            */
/*                         DAUGHTER                                           */
/*                            │                                               */
/*                            │                                               */
/*                    ─────── ❤️ ───────                                      */
/*                    │                 │                                     */
/*                Husband 1          Husband 2                                */
/*                    │                 │                                     */
/*                Children            Children                                */
/* -------------------------------------------------------------------------- */

const MultipleMarriages = ({
  node,
}: {
  node: TreeNode;
}) => {
  const marriages = (node.marriages || []).filter(
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
   * Only the first TWO marriages are displayed in the
   * special multiple-husband layout.
   */
  const firstMarriage = marriages[0];
  const secondMarriage = marriages[1];

  if (!secondMarriage) {
    return (
      <SingleMarriage
        node={node}
        marriage={firstMarriage}
      />
    );
  }

  const firstSpouse = getSpouse(firstMarriage);
  const secondSpouse = getSpouse(secondMarriage);

  return (
    <div className="flex flex-col items-center">

      {/* ================================================================ */}
      {/* DAUGHTER                                                         */}
      {/* ================================================================ */}

      <PersonCard member={node.member} />

      {/* Daughter → central relationship */}
      <div className="h-8 w-px bg-gray-300" />

      {/* ================================================================ */}
      {/* CENTRAL HEART + TWO HUSBANDS                                     */}
      {/* ================================================================ */}

      <div className="relative">

        {/* One single horizontal relationship line */}
        <div
          className="absolute left-[250px] right-[250px] top-5 h-px bg-gray-300"
        />

        <div className="flex items-start justify-center">

          {/* ========================================================== */}
          {/* HUSBAND 1                                                   */}
          {/* ========================================================== */}

          <div className="flex w-[250px] flex-col items-center">
            <div className="h-5 w-px bg-gray-300" />

            <PersonCard member={firstSpouse} />

            <ChildrenRow
              items={firstMarriage.children || []}
            />
          </div>

          {/* ========================================================== */}
          {/* CENTRAL HEART                                               */}
          {/* ========================================================== */}

          <div className="flex w-[80px] flex-col items-center">
            <Heart />
          </div>

          {/* ========================================================== */}
          {/* HUSBAND 2                                                   */}
          {/* ========================================================== */}

          <div className="flex w-[250px] flex-col items-center">
            <div className="h-5 w-px bg-gray-300" />

            <PersonCard member={secondSpouse} />

            <ChildrenRow
              items={secondMarriage.children || []}
            />
          </div>

        </div>
      </div>

      {/* ================================================================ */}
      {/* IF THERE ARE MORE THAN TWO MARRIAGES                             */}
      {/* ================================================================ */}

      {marriages.length > 2 && (
        <div className="mt-8 flex flex-col items-center">
          <p className="mb-4 text-xs font-medium text-gray-400">
            Additional relationships
          </p>

          <div className="flex flex-wrap justify-center gap-8">
            {marriages.slice(2).map((marriage) => {
              const spouse = getSpouse(marriage);

              return (
                <div
                  key={marriage.id}
                  className="flex flex-col items-center"
                >
                  <Heart />

                  <div className="mt-3">
                    <PersonCard member={spouse} />
                  </div>

                  <ChildrenRow
                    items={marriage.children || []}
                  />
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
/* MAIN FAMILY TREE NODE                                                      */
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

  /* Two or more spouses */
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

