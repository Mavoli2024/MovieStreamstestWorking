import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

export function ErrorHandling() {
  const [selectedIssue, setSelectedIssue] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const feedbackMutation = useMutation({
    mutationFn: async (data: { issueType: string; description: string }) => {
      return await apiRequest("POST", "/api/feedback", {
        userId: "current-user-id", // This would come from auth context
        issueType: data.issueType,
        description: data.description,
        severity: data.issueType === "loading" ? "critical" : "medium"
      });
    },
    onSuccess: () => {
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback. Our team will investigate the issue.",
      });
      setSelectedIssue("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmitFeedback = () => {
    if (!selectedIssue) {
      toast({
        title: "Please select an issue type",
        variant: "destructive",
      });
      return;
    }

    feedbackMutation.mutate({
      issueType: selectedIssue,
      description: description
    });
  };

  const testScenarioMutation = useMutation({
    mutationFn: async (scenario: string) => {
      // Simulate different error scenarios for testing
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { scenario, result: "Test completed" };
    },
    onSuccess: (data) => {
      toast({
        title: "Test Scenario Complete",
        description: `${data.scenario} test has been executed successfully.`,
      });
    }
  });

  const runDiagnostics = async () => {
    toast({
      title: "Running Diagnostics",
      description: "Checking your connection and system performance...",
    });

    // Simulate diagnostics
    setTimeout(() => {
      toast({
        title: "Diagnostics Complete",
        description: "No issues detected. Your system is operating normally.",
      });
    }, 3000);
  };

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-8 text-center" data-testid="text-error-handling-title">
          Error Handling & Recovery
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Error Scenarios */}
          <div className="madifa-card rounded-xl p-8">
            <h3 className="text-xl font-semibold mb-6 text-madifa-orange">
              Common Error Scenarios
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-red-400">Network Timeout</h4>
                  <span className="text-xs bg-red-800 text-red-200 px-2 py-1 rounded">CRITICAL</span>
                </div>
                <p className="text-sm text-gray-300 mb-3">Automatic retry with exponential backoff</p>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => testScenarioMutation.mutate("Network Timeout")}
                  disabled={testScenarioMutation.isPending}
                  data-testid="button-test-timeout"
                >
                  {testScenarioMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Test Scenario
                </Button>
              </div>

              <div className="p-4 bg-yellow-900/20 border border-yellow-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-yellow-400">Quality Degradation</h4>
                  <span className="text-xs bg-yellow-800 text-yellow-200 px-2 py-1 rounded">WARNING</span>
                </div>
                <p className="text-sm text-gray-300 mb-3">Automatic quality reduction and user notification</p>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => testScenarioMutation.mutate("Quality Degradation")}
                  disabled={testScenarioMutation.isPending}
                  data-testid="button-test-quality"
                >
                  {testScenarioMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Test Scenario
                </Button>
              </div>

              <div className="p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-blue-400">CDN Failover</h4>
                  <span className="text-xs bg-blue-800 text-blue-200 px-2 py-1 rounded">INFO</span>
                </div>
                <p className="text-sm text-gray-300 mb-3">Seamless switch to backup CDN servers</p>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => testScenarioMutation.mutate("CDN Failover")}
                  disabled={testScenarioMutation.isPending}
                  data-testid="button-test-cdn"
                >
                  {testScenarioMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Test Scenario
                </Button>
              </div>
            </div>
          </div>

          {/* User Feedback System */}
          <div className="madifa-card rounded-xl p-8">
            <h3 className="text-xl font-semibold mb-6 text-madifa-purple">
              User Feedback System
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Experiencing playback issues?
                </label>
                <Select value={selectedIssue} onValueChange={setSelectedIssue}>
                  <SelectTrigger data-testid="select-issue-type">
                    <SelectValue placeholder="Select issue type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buffering">Excessive buffering</SelectItem>
                    <SelectItem value="quality">Poor video quality</SelectItem>
                    <SelectItem value="audio">Audio sync issues</SelectItem>
                    <SelectItem value="loading">Video won't load</SelectItem>
                    <SelectItem value="other">Other issue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Additional details
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your experience..."
                  className="bg-madifa-gray border-gray-600"
                  data-testid="textarea-feedback"
                />
              </div>

              <div className="flex space-x-4">
                <Button 
                  className="flex-1 madifa-button-primary"
                  onClick={handleSubmitFeedback}
                  disabled={feedbackMutation.isPending}
                  data-testid="button-submit-feedback"
                >
                  {feedbackMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Submit Feedback
                </Button>
                <Button 
                  variant="secondary"
                  className="flex-1"
                  onClick={runDiagnostics}
                  data-testid="button-run-diagnostics"
                >
                  Run Diagnostics
                </Button>
              </div>

              <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg">
                <div className="flex items-center mb-2">
                  <CheckCircle className="text-green-400 w-5 h-5 mr-2" />
                  <span className="font-semibold text-green-400">System Status: Optimal</span>
                </div>
                <p className="text-sm text-gray-300" data-testid="text-system-status">
                  All streaming services are operating normally
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
