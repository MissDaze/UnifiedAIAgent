import { TeamCard } from '../TeamCard';

export default function TeamCardExample() {
  //todo: remove mock functionality
  const mockMembers = [
    { name: "Writer", initials: "WR" },
    { name: "Editor", initials: "ED" },
    { name: "SEO", initials: "SE" },
    { name: "Researcher", initials: "RS" }
  ];

  return (
    <TeamCard
      name="Content Creation Team"
      members={mockMembers}
      description="Collaborative team for creating and optimizing blog content"
    />
  );
}
