import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { familyStories } from '../data/familyData';
import { supabase } from '../lib/supabaseClient';
import { BookOpen, Heart, MessageCircle, Quote, PenLine, Tag, ArrowRight, X } from 'lucide-react';

export default function StoriesPage() {
  const { setCurrentPage, currentUser, isAuthenticated } = useStore();
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState('All');

  const [dbStories, setDbStories] = useState<any[]>([]);

  const [showStoryForm, setShowStoryForm] = useState(false);
  const [storyTitle, setStoryTitle] = useState('');
  const [storyContent, setStoryContent] = useState('');
  const [storyExcerpt, setStoryExcerpt] = useState('');
  const [storyTags, setStoryTags] = useState('');
  const [postingStory, setPostingStory] = useState(false);
  const [storyFormError, setStoryFormError] = useState('');

  const fetchStories = async () => {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDbStories(
        data.map((s: any) => ({
          id: s.id,
          title: s.title,
          author: s.author_name,
          date: s.created_at,
          content: s.content,
          excerpt: s.excerpt,
          image: s.image,
          likes: s.likes,
          comments: s.comments,
          tags: Array.isArray(s.tags) ? s.tags : [],
        }))
      );
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const allStories = [...dbStories, ...familyStories];

  const allTags = ['All', ...Array.from(new Set(allStories.flatMap(s => s.tags || [])))];

  const filtered = allStories.filter(s =>
    activeTag === 'All' || (s.tags || []).includes(activeTag)
  );

  const selectedStory = allStories.find(s => s.id === selected);

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const submitStory = async () => {
    setStoryFormError('');

    if (!storyTitle.trim() || !storyContent.trim()) {
      setStoryFormError('Please fill in a title and story content.');
      return;
    }

    if (!currentUser) return;

    setPostingStory(true);

    const tagsArray = storyTags.split(',').map(t => t.trim()).filter(Boolean);
    const excerpt = storyExcerpt.trim() || storyContent.trim().slice(0, 150) + '...';

    const { error } = await supabase.from('stories').insert({
      title: storyTitle.trim(),
      author_name: currentUser.name,
      content: storyContent.trim(),
      excerpt,
      tags: tagsArray.length ? tagsArray : ['Memories'],
      created_by: currentUser.id,
    });

    if (!error) {
      setStoryTitle('');
      setStoryContent('');
      setStoryExcerpt('');
      setStoryTags('');
      setShowStoryForm(false);
      fetchStories();
    } else {
      console.error('Error posting story:', error);
      setStoryFormError('Something went wrong. Please try again.');
    }

    setPostingStory(false);
  };

  const openStoryForm = () => {
    if (!isAuthenticated) {
      setCurrentPage('signin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setShowStoryForm(true);
  };

  const handleNav = (target: string) => {
    const pageMap: Record<string, string> = {
      home: 'home',
      family: 'family',
      gallery: 'gallery',
      events: 'events',
      stories: 'stories',
      portal: 'portal',
      signin: 'signin',
    };

    setCurrentPage(pageMap[target] ?? 'home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="pt-24 pb-12 bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src="/images/family-tree.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <BookOpen size={14} />
            Family Stories
          </div>
          <h1 className="font-montserrat text-5xl font-bold text-white mb-4">Stories Worth Telling</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Our history lives in the stories we share. Every tale told keeps the Kornu spirit alive for future generations.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Tag Filter */}
        <div className="flex gap-3 flex-wrap justify-center mb-10">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTag === tag
                  ? 'bg-gradient-to-r from-purple-500 to-orange-500 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
              }`}
            >
              {tag !== 'All' && <Tag size={11} />}
              {tag}
            </button>
          ))}
        </div>

        {/* Featured Story */}
        {filtered.length > 0 && (
          <div
            className="bg-white rounded-3xl shadow-lg overflow-hidden mb-8 cursor-pointer card-hover group"
            onClick={() => setSelected(filtered[0].id)}
          >
            {filtered[0].image && (
              <div className="h-64 overflow-hidden">
                <img
                  src={filtered[0].image}
                  alt={filtered[0].title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            )}
            <div className="p-8">
              <div className="flex gap-2 mb-4 flex-wrap">
                {(filtered[0].tags || []).map((tag: string) => (
                  <span key={tag} className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-medium">
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="font-montserrat text-3xl font-bold text-gray-900 mb-4">{filtered[0].title}</h2>
              <div className="flex items-start gap-3 mb-4">
                <Quote size={20} className="text-orange-400 mt-1 flex-shrink-0" />
                <p className="text-gray-500 text-base leading-relaxed italic">{filtered[0].excerpt}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                    {filtered[0].author?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{filtered[0].author}</p>
                    <p className="text-xs text-gray-400">{new Date(filtered[0].date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-sm text-gray-400">
                    <Heart size={14} className="text-red-400" /> {filtered[0].likes + (liked[filtered[0].id] ? 1 : 0)}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-gray-400">
                    <MessageCircle size={14} /> {filtered[0].comments}
                  </span>
                  <button className="text-orange-500 text-sm font-semibold flex items-center gap-1">
                    Read Full Story <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other Stories */}
        <div className="grid md:grid-cols-2 gap-6">
          {filtered.slice(1).map((story) => (
            <div
              key={story.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover cursor-pointer group"
              onClick={() => setSelected(story.id)}
            >
              {story.image && (
                <div className="h-44 overflow-hidden">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex gap-2 mb-3 flex-wrap">
                  {(story.tags || []).slice(0, 2).map((tag: string) => (
                    <span key={tag} className="bg-orange-50 text-orange-600 text-xs px-2.5 py-1 rounded-full font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="font-bold text-gray-900 font-montserrat text-lg mb-3 leading-snug line-clamp-2">{story.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4">{story.excerpt}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                      {story.author?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700">{story.author}</p>
                      <p className="text-xs text-gray-400">{new Date(story.date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => toggleLike(story.id, e)}
                      className={`flex items-center gap-1 text-xs transition-colors ${
                        liked[story.id] ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
                      }`}
                    >
                      <Heart size={13} className={liked[story.id] ? 'fill-current' : ''} />
                      {story.likes + (liked[story.id] ? 1 : 0)}
                    </button>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <MessageCircle size={13} /> {story.comments}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400 text-lg">No stories in this category yet</p>
          </div>
        )}

        {/* Submit Story CTA */}
        <div className="mt-12 bg-white rounded-3xl border-2 border-dashed border-orange-200 p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <PenLine size={28} className="text-orange-500" />
          </div>
          <h3 className="font-montserrat text-2xl font-bold text-gray-900 mb-3">Share Your Story</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Have a memory, lesson, or tale from the Kornu family? Sign in and add your story to our growing collection.
          </p>
          <button className="btn-primary" onClick={openStoryForm}>
            <PenLine size={16} />
            Write a Story
          </button>
        </div>
      </div>

      {/* Story Modal */}
      {selectedStory && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full my-8 overflow-hidden shadow-2xl fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedStory.image && (
              <div className="h-56 overflow-hidden">
                <img src={selectedStory.image} alt={selectedStory.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-8">
              <div className="flex gap-2 mb-4 flex-wrap">
                {(selectedStory.tags || []).map((tag: string) => (
                  <span key={tag} className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-medium">
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="font-montserrat text-2xl font-bold text-gray-900 mb-4">{selectedStory.title}</h2>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold">
                  {selectedStory.author?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{selectedStory.author}</p>
                  <p className="text-xs text-gray-400">{new Date(selectedStory.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="prose prose-gray max-w-none">
                {selectedStory.content.split('\n\n').map((para: string, i: number) => (
                  <p key={i} className="text-gray-600 leading-relaxed mb-4 text-base">{para}</p>
                ))}
              </div>
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <button
                    onClick={(e) => toggleLike(selectedStory.id, e)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      liked[selectedStory.id]
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
                    }`}
                  >
                    <Heart size={14} className={liked[selectedStory.id] ? 'fill-current' : ''} />
                    {selectedStory.likes + (liked[selectedStory.id] ? 1 : 0)} Likes
                  </button>
                  <span className="flex items-center gap-1.5 text-sm text-gray-400">
                    <MessageCircle size={14} /> {selectedStory.comments} Comments
                  </span>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-gray-400 hover:text-gray-600 text-sm px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Write a Story Modal */}
      {showStoryForm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowStoryForm(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-montserrat text-xl font-bold text-gray-900">Write a Story</h2>
              <button
                onClick={() => setShowStoryForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={storyTitle}
                onChange={(e) => setStoryTitle(e.target.value)}
                placeholder="Story title"
                className="input-field"
              />

              <textarea
                value={storyExcerpt}
                onChange={(e) => setStoryExcerpt(e.target.value)}
                placeholder="Short excerpt (optional — auto-generated if left blank)"
                rows={2}
                className="input-field resize-none"
              />

              <textarea
                value={storyContent}
                onChange={(e) => setStoryContent(e.target.value)}
                placeholder="Tell your story... (use blank lines to separate paragraphs)"
                rows={8}
                className="input-field resize-none"
              />

              <input
                type="text"
                value={storyTags}
                onChange={(e) => setStoryTags(e.target.value)}
                placeholder="Tags, comma separated (e.g. Heritage, Memories)"
                className="input-field"
              />

              {storyFormError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
                  {storyFormError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowStoryForm(false)}
                  className="flex-1 border border-gray-200 rounded-xl py-2.5 text-gray-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={submitStory}
                  disabled={postingStory}
                  className="flex-1 btn-primary justify-center disabled:opacity-60"
                >
                  {postingStory ? 'Posting...' : 'Share Story'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ FOOTER ============ */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br items-center justify-center">
                  <img src="/images/kornu-logo.png" alt="Kornu" className="w-full h-full object-cover"
                    onError={(e) => {
                      const t = e.target as HTMLImageElement;
                      t.style.display = 'none';
                      t.parentElement!.innerHTML = '<span style="color:white;font-weight:900;font-size:1.3rem;font-family:serif;">K</span>';
                    }}
                  />
                </div>
                <div>
                  <div className="font-bold text-lg font-montserrat">The Kornu Family</div>
                  <div className="text-orange-400 text-xs uppercase tracking-widest">Est. 1946 · Ve-Gbodome, Ghana</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                Where every memory is treasured, every story is celebrated, and every family member is loved — always.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-widest text-gray-400 mb-4">Explore</h4>
              <ul className="space-y-2">
                {['Home', 'Our Family', 'Gallery', 'Events', 'Stories', 'Portal'].map((link) => (
                  <li key={link}>
                    <button
                      onClick={() => handleNav(link.toLowerCase().replace('our ', ''))}
                      className="text-gray-400 hover:text-orange-400 text-sm transition-colors"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-widest text-gray-400 mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Ve-Gbodome, Ghana</li>
                <li>family@kornu.family</li>
                <li className="pt-2">
                  <button
                    onClick={() => handleNav('signin')}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-xs font-semibold transition-colors"
                  >
                    Sign In to Portal
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © 2025 The Kornu Family Website. All rights reserved. Made with for our family.
            </p>
            <p className="text-gray-600 text-xs">
              "A family is a circle of strength and love" — Granpa John Lily Kornu
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}