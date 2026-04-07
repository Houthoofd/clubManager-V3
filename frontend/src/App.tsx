import {
  Page,
  PageSection,
  Title,
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
} from "@patternfly/react-core";
import { RocketIcon } from "@patternfly/react-icons";

function App() {
  return (
    <Page>
      <PageSection>
        <EmptyState>
          <EmptyStateIcon icon={RocketIcon} />
          <Title headingLevel="h1" size="lg">
            ClubManager V3
          </Title>
          <EmptyStateBody>
            Bienvenue dans ClubManager V3 - Votre application de gestion de club
            sportif.
            <br />
            <br />
            L'application est en cours de développement.
          </EmptyStateBody>
        </EmptyState>
      </PageSection>
    </Page>
  );
}

export default App;
