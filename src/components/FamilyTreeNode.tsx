import { Heart } from 'lucide-react';

type DbMember = {
  id: string;
  name: string;
  role: string;
  image: string;
  dateOfPassing?: string;
};

type TreeNode = {
  member: DbMember;
  spouse?: DbMember;
  children: TreeNode[];
};

function FamilyTreeCard({ person }: { person: DbMember }) {
  return (
    <div className="inline-flex flex-col items-center bg-white border-2 border-orange-200 rounded-2xl p-3 shadow-sm min-w-[110px]">
      <img
        src={person.image}
        alt={person.name}
        className={`w-14 h-14 rounded-full object-cover mb-2 ${
          person.dateOfPassing ? 'grayscale-[40%]' : ''
        }`}
        onError={(e) => {
          e.currentTarget.src = '/images/placeholder.jpg';
        }}
      />
      <p className="text-xs font-bold text-gray-900 leading-tight text-center">{person.name}</p>
      <p className="text-[10px] text-gray-400 text-center">{person.role}</p>
      {person.dateOfPassing && <span className="text-[10px] mt-0.5">🕊️</span>}
    </div>
  );
}

function FamilyTreeNode({ node, isRoot = false }: { node: TreeNode; isRoot?: boolean }) {
  const hasChildren = node.children.length > 0;

  // This governs the INCOMING connector — the line linking this node to
  // its siblings and up to its own parent. Unrelated to the heart change
  // below, which only affects the OUTGOING line down to this node's kids.
  const connectorClasses = isRoot
    ? ''
    : [
        'pt-6',
        "before:content-[''] before:absolute before:top-0 before:right-1/2 before:w-1/2 before:h-6 before:border-t before:border-gray-300",
        "after:content-[''] after:absolute after:top-0 after:left-1/2 after:w-1/2 after:h-6 after:border-t after:border-l after:border-gray-300",
        'first:before:border-t-0',
        'last:after:border-0 last:before:border-r last:before:border-gray-300',
        'only:before:hidden only:after:hidden only:pt-0',
      ].join(' ');

  return (
    <li className={`list-none relative flex flex-col items-center px-4 ${connectorClasses}`}>
      <div className="flex items-center gap-2 justify-center">
        <FamilyTreeCard person={node.member} />

        {node.spouse && (
          // self-stretch makes this thin wrapper match the full height of
          // the row (i.e. the taller of the two cards), so the heart
          // stays visually centered between the cards while its own
          // bottom edge lines up with the bottom of the cards — that's
          // where the descendant line below attaches.
          <div className="relative self-stretch flex items-center justify-center w-5 flex-shrink-0">
            <Heart size={14} className="text-orange-400 fill-orange-400" />
            {hasChildren && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-6 bg-gray-300" />
            )}
          </div>
        )}

        {node.spouse && <FamilyTreeCard person={node.spouse} />}
      </div>

      {/* Single parent, no spouse recorded — line drops from directly
          under their card instead of from a heart. */}
      {hasChildren && !node.spouse && <div className="w-px h-6 bg-gray-300" />}

      {/* Married couple — the heart above already drew its own stub,
          this just reserves the matching space so the <ul> below starts
          right where that stub ends, instead of overlapping it. */}
      {hasChildren && node.spouse && <div className="h-6" aria-hidden="true" />}

      {hasChildren && (
        <ul className="list-none relative flex justify-center">
          {node.children.map((child) => (
            <FamilyTreeNode key={child.member.id} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default FamilyTreeNode;
